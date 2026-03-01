#!/usr/bin/env python3
import numpy as np, argparse

def potential(phi):
    return (1-np.exp(-phi/5.0))**2

def main():
    p=argparse.ArgumentParser()
    p.add_argument("--beta",type=float,default=0.5)
    p.add_argument("--Delta",type=float,default=0.2)
    p.add_argument("--out",type=str,default="potential_tab.dat")
    args=p.parse_args()

    phis=np.linspace(0.01,10,2000)
    V=potential(phis)
    dV=np.gradient(V,phis)
    d2V=np.gradient(dV,phis)

    with open(args.out,"w") as f:
        for a,b,c,d in zip(phis,V,dV,d2V):
            f.write(f"{a:.8e} {b:.8e} {c:.8e} {d:.8e}\n")
    print("Saved",args.out)

if __name__=="__main__":
    main()
