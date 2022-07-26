export const idlFactory = ({ IDL }) => {
  const UniqueId = IDL.Text;
  const Result = IDL.Variant({ 'ok' : IDL.Text, 'err' : IDL.Text });
  const Time = IDL.Int;
  const Result_6 = IDL.Variant({ 'ok' : UniqueId, 'err' : IDL.Text });
  const Result_5 = IDL.Variant({ 'ok' : IDL.Nat, 'err' : IDL.Text });
  const Result_4 = IDL.Variant({ 'ok' : IDL.Text, 'err' : IDL.Vec(IDL.Nat) });
  const StartTime = IDL.Int;
  const StopTime = IDL.Int;
  const NominalInterval = IDL.Tuple(StartTime, StopTime);
  const Interval = IDL.Tuple(StartTime, StopTime);
  const ScheduledStatus = IDL.Variant({
    'scheduled' : NominalInterval,
    'active' : IDL.Tuple(StartTime, IDL.Opt(NominalInterval)),
    'completed' : IDL.Tuple(Interval, IDL.Opt(NominalInterval)),
    'unscheduled' : IDL.Null,
  });
  const Todo = IDL.Record({
    'id' : UniqueId,
    'title' : IDL.Text,
    'content' : IDL.Text,
    'tags' : IDL.Vec(IDL.Text),
    'epochCreationTime' : Time,
    'epochLastUpdateTime' : Time,
    'currentScheduledStatus' : ScheduledStatus,
  });
  const Result_3 = IDL.Variant({ 'ok' : IDL.Vec(Todo), 'err' : IDL.Text });
  const Result_2 = IDL.Variant({ 'ok' : Todo, 'err' : IDL.Text });
  const UserMetadata = IDL.Record({
    'epochCreationTime' : Time,
    'preferredDisplayName' : IDL.Text,
    'epochLastUpdateTime' : Time,
    'emailAddress' : IDL.Text,
    'monotonicCreateTodoCount' : IDL.Nat,
  });
  const Result_1 = IDL.Variant({ 'ok' : UserMetadata, 'err' : IDL.Text });
  const anon_class_28_1 = IDL.Service({
    'DEBUG_resetUserTodos' : IDL.Func([], [], []),
    'activateScheduledOrUnscheduledTodo' : IDL.Func(
        [IDL.Record({ 'todoIdIn' : UniqueId })],
        [Result],
        [],
      ),
    'addNewActiveTodo' : IDL.Func(
        [
          IDL.Record({
            'contentIn' : IDL.Opt(IDL.Text),
            'tagsIn' : IDL.Opt(IDL.Vec(IDL.Text)),
            'titleIn' : IDL.Opt(IDL.Text),
          }),
        ],
        [Result],
        [],
      ),
    'addNewScheduledTodo' : IDL.Func(
        [
          IDL.Record({
            'contentIn' : IDL.Opt(IDL.Text),
            'tagsIn' : IDL.Opt(IDL.Vec(IDL.Text)),
            'scheduledStopTime' : Time,
            'scheduledStartTime' : Time,
            'titleIn' : IDL.Opt(IDL.Text),
          }),
        ],
        [Result],
        [],
      ),
    'addNewUnscheduledTodo' : IDL.Func(
        [
          IDL.Record({
            'contentIn' : IDL.Opt(IDL.Text),
            'tagsIn' : IDL.Opt(IDL.Vec(IDL.Text)),
            'titleIn' : IDL.Opt(IDL.Text),
          }),
        ],
        [Result],
        [],
      ),
    'authenticateWithUserAccountCreationIfNecessary' : IDL.Func(
        [],
        [Result_6],
        [],
      ),
    'completeActiveTodo' : IDL.Func(
        [IDL.Record({ 'todoIdIn' : UniqueId })],
        [Result],
        [],
      ),
    'getTotalCreatedTodoCount' : IDL.Func([], [Result_5], []),
    'greet' : IDL.Func([], [IDL.Text], []),
    'helloCanister' : IDL.Func([], [IDL.Text], []),
    'orderTest' : IDL.Func(
        [
          IDL.Record({
            'secondArg' : IDL.Nat,
            'thirdArg' : IDL.Text,
            'firstArg' : IDL.Opt(IDL.Text),
          }),
        ],
        [Result_4],
        [],
      ),
    'queryAllTodosOfUser' : IDL.Func([], [Result_3], []),
    'querySpecificTodoOfUser' : IDL.Func(
        [IDL.Record({ 'todoIdIn' : UniqueId })],
        [Result_2],
        [],
      ),
    'queryUserMetadata' : IDL.Func([], [Result_1], []),
    'removeExistingTodo' : IDL.Func(
        [IDL.Record({ 'todoIdIn' : UniqueId })],
        [Result],
        [],
      ),
    'rescheduleScheduledTodo' : IDL.Func(
        [
          IDL.Record({
            'todoIdIn' : UniqueId,
            'newScheduledStartTime' : Time,
            'newScheduledStopTime' : Time,
          }),
        ],
        [Result],
        [],
      ),
    'scheduledUnscheduledTodo' : IDL.Func(
        [
          IDL.Record({
            'todoIdIn' : UniqueId,
            'scheduledStopTime' : Time,
            'scheduledStartTime' : Time,
          }),
        ],
        [Result],
        [],
      ),
    'unscheduleScheduledTodo' : IDL.Func(
        [IDL.Record({ 'todoInIn' : UniqueId })],
        [Result],
        [],
      ),
    'updateSpecificTodoMetadataOrContent' : IDL.Func(
        [
          IDL.Record({
            'todoIdIn' : UniqueId,
            'contentIn' : IDL.Opt(IDL.Text),
            'tagsIn' : IDL.Opt(IDL.Vec(IDL.Text)),
            'titleIn' : IDL.Opt(IDL.Text),
          }),
        ],
        [Result],
        [],
      ),
    'updateUserMetadata' : IDL.Func(
        [
          IDL.Record({
            'emailAddressIn' : IDL.Opt(IDL.Text),
            'preferredDisplayNameIn' : IDL.Opt(IDL.Text),
          }),
        ],
        [Result],
        [],
      ),
  });
  return anon_class_28_1;
};
export const init = ({ IDL }) => { return []; };
