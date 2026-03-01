/* Minimal table interpolation for CLASS */
#include <stdio.h>
#include <stdlib.h>
int N_tab = 0;
double *phi_tab, *U_tab, *Up_tab, *Upp_tab;

double interp_linear(const double *x, const double *y, int N, double xv){
  if (xv <= x[0]) return y[0];
  if (xv >= x[N-1]) return y[N-1];
  int i;
  for(i=0;i<N-1;i++) if(x[i]<=xv && xv<=x[i+1]) break;
  double t=(xv-x[i])/(x[i+1]-x[i]);
  return y[i]+t*(y[i+1]-y[i]);
}

void potential_from_table(double phi,double *U,double *Up,double *Upp){
  *U   = interp_linear(phi_tab,U_tab,N_tab,phi);
  *Up  = interp_linear(phi_tab,Up_tab,N_tab,phi);
  *Upp = interp_linear(phi_tab,Upp_tab,N_tab,phi);
}
