import argparse
import json
from pathlib import Path
from typing import List, Sequence, Tuple

import numpy as np
import pandas as pd


def read_param_names(path: Path) -> List[str]:
    names: List[str] = []
    for raw in path.read_text().splitlines():
        stripped = raw.strip()
        if not stripped:
            continue
        # Paramnames files are `name \t label`, keep the identifier.
        names.append(stripped.split()[0])
    return names


def weighted_quantiles(
    values: np.ndarray, weights: np.ndarray, probs: Sequence[float]
) -> np.ndarray:
    order = np.argsort(values)
    sorted_vals = values[order]
    sorted_weights = weights[order]
    total = np.sum(sorted_weights)
    if total == 0:
        return np.full(len(probs), np.nan)
    cdf = (np.cumsum(sorted_weights) - 0.5 * sorted_weights) / total
    # Guard endpoints so interpolation always has support.
    cdf = np.concatenate(([0.0], cdf, [1.0]))
    sorted_vals = np.concatenate(
        ([sorted_vals[0]], sorted_vals, [sorted_vals[-1]])
    )
    return np.interp(probs, cdf, sorted_vals)


def summarize_parameters(df: pd.DataFrame) -> pd.DataFrame:
    weights = df["weight"].to_numpy()
    total_weight = np.sum(weights)
    summaries: List[Tuple] = []
    for column in df.columns:
        if column in ("weight", "minus_loglike"):
            continue
        values = df[column].to_numpy()
        mean = float(np.sum(values * weights) / total_weight)
        variance = float(np.sum(weights * (values - mean) ** 2) / total_weight)
        std = float(np.sqrt(variance))
        q16, q84, q025, q975, median = weighted_quantiles(
            values,
            weights,
            probs=(0.16, 0.84, 0.025, 0.975, 0.5),
        )
        summaries.append(
            (
                column,
                mean,
                std,
                float(median),
                float(q16),
                float(q84),
                float(q025),
                float(q975),
            )
        )
    return pd.DataFrame(
        summaries,
        columns=[
            "parameter",
            "mean",
            "std",
            "median",
            "q16",
            "q84",
            "q2.5",
            "q97.5",
        ],
    )


def effective_sample_size(weights: np.ndarray) -> float:
    total = np.sum(weights)
    return float(total**2 / np.sum(weights**2))


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Ingest a MontePython chain and emit processed summaries."
    )
    parser.add_argument("--chain", required=True, type=Path)
    parser.add_argument("--param-names", required=True, type=Path)
    parser.add_argument("--output-dir", required=True, type=Path)
    parser.add_argument(
        "--label",
        required=True,
        help="Prefix for generated artifact filenames (e.g., alpha_chain)",
    )
    parser.add_argument(
        "--burn-in-delta",
        type=float,
        default=5e6,
        help="Offset added to the minimum -lnL to set the burn-in threshold.",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    param_names = read_param_names(args.param_names)
    columns = ["weight", "minus_loglike"] + param_names
    df = pd.read_csv(
        args.chain,
        sep=r"\s+",
        engine="python",
        header=None,
        names=columns,
    )
    try:
        source_path = str(args.chain.relative_to(Path.cwd()))
    except ValueError:
        source_path = str(args.chain)
    rows_total = len(df)
    minus_loglike_min = float(df["minus_loglike"].min())
    minus_loglike_median = float(df["minus_loglike"].median())
    burn_in_threshold = minus_loglike_min + args.burn_in_delta
    mask = df["minus_loglike"] <= burn_in_threshold
    if mask.any():
        burn_in_index = int(mask.idxmax())
    else:
        burn_in_index = 0
    post = df.iloc[burn_in_index:].reset_index(drop=True)
    rows_post = len(post)

    args.output_dir.mkdir(parents=True, exist_ok=True)
    post_path = args.output_dir / f"{args.label}_post.csv"
    post.to_csv(post_path, index=False)

    total_weight_post = float(post["weight"].sum())

    ingest_metadata = {
        "source": source_path,
        "param_count": len(param_names),
        "columns": columns,
        "rows_total": rows_total,
        "rows_post_burn": rows_post,
        "burn_in_index": burn_in_index,
        "burn_in_threshold": burn_in_threshold,
        "burn_in_fraction": float(burn_in_index / rows_total)
        if rows_total
        else 0.0,
        "minus_loglike_min": minus_loglike_min,
        "minus_loglike_median": minus_loglike_median,
        "total_weight_post": total_weight_post,
    }
    (args.output_dir / "ingest_metadata.json").write_text(
        json.dumps(ingest_metadata, indent=2)
    )

    weights = post["weight"].to_numpy()
    diag = {
        "unique_samples": rows_post,
        "total_weight_post": total_weight_post,
        "effective_sample_size": effective_sample_size(weights),
        "max_weight": float(weights.max()) if len(weights) else float("nan"),
        "median_weight": float(np.median(weights)) if len(weights) else float("nan"),
    }
    best_idx = int(post["minus_loglike"].idxmin())
    diag.update(
        {
            "bestfit_minus_loglike": float(post.loc[best_idx, "minus_loglike"]),
            "bestfit_index_post": best_idx,
            "bestfit_params": {
                col: float(post.loc[best_idx, col])
                for col in post.columns
                if col not in ("weight", "minus_loglike")
            },
            "ingest_meta": ingest_metadata,
        }
    )
    (args.output_dir / "diagnostics.json").write_text(
        json.dumps(diag, indent=2)
    )

    summary = summarize_parameters(post)
    summary_path = args.output_dir / "posterior_summary.csv"
    summary.to_csv(summary_path, index=False)


if __name__ == "__main__":
    main()
