# 👷‍♀️ FAQ!

1. How to speak to `ChatGPT` about `Ace`?!
    - I love to preface prompts w/ this:
    - This code is coming from Ace, which is a framework that is Solid Start w/ additional type safety!

1. How to show intellisense dropdown in VS Code?
    - `Control` + `Space`
    
1. How to reload VS Code?
    - `Command` + `Shift` + `P`
    - Type: `reload window`
    - Press `Enter`

1. How to open VS Code `settings.json`
    - `Command` + `Shift` + `P`
    - Type: `user settings json`
    - Press `Enter`

1. How to get VS Code to create `<div class="example"></div>` on `.example`
    - @ VS Code `settings.json` add:
        ```json
        {
          "emmet.includeLanguages": {
            "typescriptreact": "html",
            "javascriptreact": "html"
          }
        }
        ```
    - Reload VS Code!

1. How to run `code .` in VS Code `bash` & have it open a new VS Code in that directory
    - `Command` + `Shift` + `P`
    - Type: `Shell Command: Install 'code' command in PATH`
    - Press `Enter`

1. How to get the alter icon for `.tsx` files in VS Code
    - Download the `Symbols` extension by `Miguel Solorio`
    - Bash cd into `~/.vscode/extensions/`
    - Bash cd `miguelsolorio.symbols-` w/ the proper version
    - Bash: `code .`
    - @ `/src/icons/files/` place image
    - @ `/src/symbol-icon-theme.json` w/in `iconDefinitions` place `"ace": { "iconPath": "./icons/files/[ image name & extension ]" },`
    - @ `fileExtensions` update `"tsx": "ace",` & anywhere else ya love!
    - @ VS Code `settings.json` add:
        ```js
        "symbols.files.associations": {
          "*.jsx": "ace",
          "*.tsx": "ace"
        }
        ```
    - Reload VS Code!
