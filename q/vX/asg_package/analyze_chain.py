import pandas as pd
import numpy as np

chain = pd.read_csv('asg_chain_clean.csv')
print(f'rows {len(chain)}')
cols = ['beta','Delta','chi0','ns','r']
for c in cols:
    x = chain[c].values
    mean = float(np.mean(x))
    std = float(np.std(x, ddof=1))
    q16, q84 = np.quantile(x, [0.16, 0.84])
    q025, q975 = np.quantile(x, [0.025, 0.975])
    print(f"{c}: mean={mean:.6f}, sigma={std:.6f}, 68%=[{q16:.6f},{q84:.6f}], 95%=[{q025:.6f},{q975:.6f}]")

print('\nPearson correlation:')
print(chain[cols].corr())
