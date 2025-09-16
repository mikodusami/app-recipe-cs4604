# Backend For Recipe Applciation CS 4604

## Steps to setup backend by cloning from Github

### MACOS Steps

- open terminal and desired directory, enter the following:
  - git clone https://github.com/michaelodusami/app-recipe-cs4604.git or by ssh
  - cd app-recipe-cs4603
  - cd backend
- ensure you have python installed: 'python3 --version'. if doesnt work, try 'python --version'. If that does not work, head to the internet to downlaod python
- continue with the following commands in the termainal:
  - enter the command 'python3 -m venv .venv' which creates a virtual enviroment
  - enter the command 'source .venv/bin/activate'
- should see something similar to this in the terminal ((.venv) ➜ backend git:(main) ✗ ) i.e. you should see the (.venv) text.
- still in the terminal, enter 'which python' and confirm you see a path to the current .venv/bin/python, something similar like this: /Users/<name-of-user>/<your-dir>/app-recipe-cs4604/backend/.venv/bin/python
- make sure if you are on VSCODE, you download the Python Extenstion
- if on VSCODE, click somehwere in the application to shift focus away from termainl, type 'cmd+shift+p' to open up the vscode command center, select
  Python: Select Interpreter' and choose the .venv file, if not, choose the reccomended one. Any problems, lmk (modusami03@vt.edu)
- open up the termainal: run 'pip install -r requirements.txt'
- then run 'fastapi dev main.py'
