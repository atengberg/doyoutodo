Updated DoYou code for second half of grant. 

Both frontend and backend code are fully functional. Additionally, local Internet Identity canister was added and the frontend is configured to point the wallet provider automatically configured to that canister's principal if deploying locally, or the default providers connect-2-ic uses if deployed to mainnet. 

After cloning:
 1) run chmod +x on /canisters/local_internet_identity/download-did-and-wasm-script* 
 2) npm install
 3) dfx start
 4) dfx deploy will have the dapp running. 
 
*Taken from https://github.com/dfinity/internet-identity/tree/main/demos/using-dev-build: if it would be better to copy a specific version so that a user does not need to chmod for the sake of easily installing, please let me know. Figured keeping it up to date / introducing typical configurations for development would be preferrable. 

The previous front-end was almost completely discarded in favor of a more reasonable design. The current front-end has all the functionality possible in the back-end: a todo of the three types can be created (unscheduled, scheduled, active), an unscheduled or scheduled todo can be rescheduled or unscheduled, and an active todo can be completed; as well as updating the metadata such as title, description or simply deleting the todo. This is all managed by a custom hook that is made available by context provider. In addition, to demonstrate similar code necessary a simpler custom hook that accesses a canister for querying and managing the user's profile / metadata was also created which also a user to update a display name and email as well as see their principal and total created todo count. The front-end uses React router to show the landing, home, create, user profile, and about screens. 

This code is intended to be released open source to serve as a foundation for writing education articles while the original DoYou app will be forked and further developed from. As managing Github through the UI is not at all ideal, it will be put in a fresh repository at that time after which the usual glow of properly using branches will be performed. 

In addition to the code, there is the first in what is planned to be a series of articles: it can be viewed here: 
https://docs.google.com/document/d/1b9q904vfqENY-Vq8WDp3ecCau59c7PVaZWDygPt9K9Q/edit?usp=sharing. 

I'm not sure if there is a better strategy than just including that article in the about page or, as it is, using the intro with a link to Medium; that is currently the plan. 

