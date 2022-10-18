This decentralized app (“dapp”) was created to demonstrate how the Internet Computer Protocol (“ICP”) created by Dfinity provides developers with a full-stack solution connecting web2 to web3 and beyond. Among other capabilities, ICP smart contracts (“canisters”) can not only host the front-end but also operate as the back-end, unifying the full-stack developer experience encoded in the usability of smart contracts. What’s more, smart contracts on the IC can directly sign to other blockchains without the need and vulnerability of bridges, to empower developers and their users to seamlessly participate in the technological revolution blockchain has initiated. If you missed out on the opportunity of buying bitcoin for a few cents on the dollar wishing you had when you had the chance, the Internet Computer is your chance to get in on the ground floor of what’s still to come...

Read the full introductory article:
 https://medium.com/@doyoutodo/introducing-doyou-todo-on-the-internet-computer-f78cc632a57c
 
Browse developer notes starting at:
 https://medium.com/@doyoutodo/project-development-notes-part-1-bc3dab9a9d05
 
See the live demo: 
 https://55qqt-niaaa-aaaal-qbe6a-cai.ic0.app/

If you don't have an Internet Identity (ICP credential) you can select the NFID provider after clicking connect to generate one to access this dapp with Google's OAuth (in does not share your Google credentials, just verifies you are who you say you are if you are logged into your Google account). Otherwise you can create an account with Astro X or Plug using a recovery phrase.  

For local deployment, after cloning (assuming dfx has been installed):
 1) run chmod +x on /canisters/local_internet_identity/download-did-and-wasm-script* 
 2) npm install
 3) dfx start
 4) dfx deploy will have the dapp running. 
 
*Taken from https://github.com/dfinity/internet-identity/tree/main/demos/using-dev-build: if it would be better to copy a specific version so that a user does not need to chmod for the sake of easily installing, please let me know. Figured keeping it up to date / introducing typical configurations for development would be preferrable. 

This code is released open source to serve as a foundation for writing education articles while the originally intended DoYou app will be forked and further developed. Here’s a synopsis of the code in this project (from the developer notes article): 

At the core of this project is the todo. Building off the sample code Dfinity provided, the primary feature of a todo is its status (scheduledStatus): while a todo has all the usual metadata (date created, last updated, title, description, tags, author) to demonstrate Motoko and in particular variants (a type of enumeration with overloadable argument type, which itself can be a tuple), the status of a todo was created around the idea of a todo having a life cycle: 

 1) A todo can be created by the user as either unscheduled, scheduled or active. 
 2) An unscheduled todo can be scheduled; a scheduled todo can be rescheduled or unscheduled. A scheduled todo also always has a planned start and stop  time. A scheduled or unscheduled todo can be ‘activated’ turning its status to active
 3) An active todo always has a real start time.
 4) An active todo can finally be completed, so that a complete todo will always have a real start and stop time. If the todo was previously scheduled before being activated, it will also have a scheduled start and stop time.

The back-end canister provides a client API that is used by the front-end canister to persist changes to user state. This is divided into three modules that wrap the functionality: PidContext which is a staging ground or scope for mapping principals to ids while UsersMetadata and UsersTodos handles the logic for a user's profile information or todo set. As classes in Motoko are not stable, these classes have a getEntries function to serialize the underlying data during upgrades; in the future, they will also have a getter and a setter so the underlying mapping collection data structure used can be swapped out to what's most efficient (such as Candb). More development notes articles to come covering the various aspects of programming on the IC and in Motoko.
