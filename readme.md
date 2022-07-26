##### you are viewing the
# DoYou ToDo on the IC Source Repository
 
*Objective:* A Dapp whose code demonstrates much of the basic functionality any dapp would want. While the focus is on the Motoko canister code, integration into a user friendly and intuitive interface is important and achieved using the React framework. While being made open source, the ultimate plan is to develop a means by which an extensible interoperable to do platform can be made easily accessible enough for anyone in the Web3 environment.
 
###*Current Functionality*
 
A user can authenticate, create and view a list of any of their own todos. The Motoko also includes the functionality to reschedule and complete a todo, as well as for the user to save metadata about themselves such as a preferred display name and email (which ideally would also include profile pic, addresses, etc). Additionally there is an imperative iteration of testing of the Motoko code in `tests.mo`, and `main_local.mo` is a clone of `main.mo` where the `msg caller` is assigned to that canister's principal for the purposes of iterating local development (more below). To deploy locally use the `frontend` branch, which points the frontend canister instance to `main_local.mo` instead of the `main.mo`.
 
###*General Todo Structure*
 
A generalized container for metadata relating to its creator, when it was created and last updated, it's current status, any tags and a content parameter:
 
` public type Todo = {` 
`id: UniqueId;`
`epochCreationTime: Time.Time;`
`epochLastUpdateTime: Time.Time;`
`title: Text;`
`content: Text;`
`tags: [Text];`
`currentScheduledStatus: ScheduledStatus;`
`};` **`(./canisters/modules/static/Types.mo)`**
 
 
###*Todo LifeCycle*
 
Building on the example first suggested by the Dfinity docs, a todo has a "life-cycle" or a flow of distinct states from when it is first created to when it is finally completed:
 
                   Create          Update                                    Finish
    User intent ->  1) Unscheduled  -> Scheduled, Active
                    1) Scheduled    -> (Unscheduled/Rescheduled), Active
                    2) Active                                              -> Completed
 
Where a scheduled todo has a declared intended start and stop time, and any completed todo at least always has a real start and stop time (which is to say for a todo to be completed, it must first be "activated"). Here's the `ScheduledStatus` variant type declaration in case the code is clearer:
 
`public type StartTime = Time.Time;`
`public type StopTime = Time.Time;`
`public type Interval = (StartTime, StopTime);`
`public type NominalInterval = Interval;`
 
`public type ScheduledStatus = {`
`    #unscheduled;`
`    #scheduled: NominalInterval;`
`    #active: (StartTime, ?NominalInterval); // if activated todo was previously scheduled -> NomInterval`
`    #completed: (Interval, ?NominalInterval); // "Real"Interval, if was previously scheduled -> NomInterval`
`  };` **`(./canisters/modules/static/Types.mo)`**

If an activated todo overlaps an existing scheduled todo before it is completed, that scheduled todo (by default setting) would get bumped to being unscheduled once again (but also flagged as having been bumped)/this is nyi.
 
###*Canister Architecture*
So far the motive has been to define reusable Motoko components (not to be confused with React's components) that capture the functionality needed. This is done with three classes defined respectively in:
 
1) `./canisters/modules/PIdContext.mo`
2) `./canisters/modules/UsersMetadata.mo`
3) `./canisters/modules/UsersTodos.mo`
 
Which encapsulates the needed functionality while also providing the underlying data as arrays that can be conveyed into stable memory as needed. `PIdContext.mo` which is not a very complicated wrapper for the collection that is responsible for verifying and linking a user's principal (the `msg caller`) to a unique id that is used as a primary key subsequently as the pointer to that user in the code. `UsersMetadata.mo` is the collection that manages creation and updates to user specific metadata, such as their email or preferred display name, and in the future would include the pointer to their profile pic blob, friend's list, etc. Finally `UsersTodos.mo` is where most of the action happens, providing the functionality of the collection for creation, edits and updates for the todos of a given user. It also provides some utility methods such as a method for getting the total todo count.
 
###*Testing and Local Development*
 
The client interface the frontend talks to is defined by methods in `main.mo`, however for the purposes of testing the same calls the underlying classes are called imperatively in `tests.mo`. Additionally for the sake of simplicity developing locally, instead of deploying Internet Identity to the local replica, `main_local` is a clone of `main.mo` where the canister's own principal supplyied as the  `msg caller` was used as the testing already provided a means of verifying multiple distinct callers would work. 
 
###*Future work*
 
This is not a totally comprehensive list, but to indicate where next steps will be taken:

*On the backend:* 
    1) Introduce a status of "MarkedComplete" so that any created Todo can always be "completed"
    2) Index all a user's supplied tags (for use in auto-complete and discovery)
    3) Refactor return types to be more explicit and use a bool in `Constants.mo` to bypass explicit assertion traps if not in production 
    4) Add a public/private field to Todos to introduce the beginnings of access control
    5) Export and import todo data by http request to the canister (an API in other words)
    6) Make todos atomic or composite so that a todo can represent a collection of todos 
    7) Additional classes to handle such collections such as posts/comments or integrating  
      
*On the frontend:* 
    1) Complete functionality for todo lifecycle, edits; user edits of their own profile metadata
    2) Searchability by using tags as keywords (at least for one's own todos)
    3) Representation of at least a "Daily Calender" so each day's todos can be viewed/updated
    4) Refactor core architecture along better React principles such as using a shared context provider and react router to reduce complexity and increase component cohesion
    5) Encapsulate canister functionality in custom reusable React hook components
    6) Double/reality check and get peer reviewed from someone who has genuine React expertise things are generally coded well enough to be an example that is good enough
   
And most importantly, documentation in the form of tutorials that would also be hosted in the "About section" covering the development process, with focus on core Motoko principals and integration into a JS based enviroment. I'd likely also post these on Medium for instance, but having the About section contain these materials would be helpful for the project itself. Additionally, creating "mini-libraries' in the form of combing relevant types to their class/data structure defined functionality to make the reusable parts of the code generally available Vessel packages. 

Ideally I was also considering using the generated IDL file representing the Motoko code to procedurally generate declarations of a Motoko variant type where each variant of that type is each method of the inputted Motoko file, and it's overload a tuple of its arguments, to provide the basis of what could be used for logging/generating a non-opaque Motoko stack trace.

###*Conclusion*

Running for the first time, be sure to run `npm install` and start and deploy the canister code with `dfx`. 

####**the frontend branch is the most up to date, it has not been merged into main yet, web frontend functionality only works with frontend branch currently**####

_Ultimately_ it would be cool to also port an Android version (at least) that for instance allows someone to make a billable hours mobile first dapp that is directly tied to a DAO or their wallets of choice so that they could be paid for work they agree to do on some other DAO's platform in their own cryptocurrency of choice, but that's getting ahead of myself. Or forking the code and using it as a basis of a code sharing DAO. Or something like a web3 powered Zapier. There are many possibilities as long as there are the basic web3 unit data structures working.

In the meantime, the current goal is to at least finish steps backend steps 1-7, frontend steps 1-4, and most importantly write tutorial materials introducing the Internet Computer, how to get started developing with Motoko, "finer" points of working within Motoko (understanding the language), and how to connect it to a frontend. I can do that in parallel why I continue to develop, and at least now fortunately I have my own dapp to keep track of myself doing those things... 
