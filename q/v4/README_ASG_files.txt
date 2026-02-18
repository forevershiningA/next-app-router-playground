Files generated in /mnt/data:
- nsr_trajectory.png  : high-res ns-r figure
- F_U_overlay.png     : F(chi) and U(chi) overlays
- ASG_paper.tex       : minimal LaTeX draft linking the figures (replace text/sections with full paper)
- ASG_bib.bib         : small bibtex file to expand

To compile the LaTeX draft into PDF locally:
$ pdflatex ASG_paper.tex
$ bibtex ASG_paper (if using citations)
$ pdflatex ASG_paper.tex
$ pdflatex ASG_paper.tex

If you want, I can also attempt to compile to PDF here if the environment supports pdflatex. 
