export const idlFactory = ({ IDL }) => {
  const UniqueId = IDL.Text;
  const PIdContextStableState = IDL.Vec(IDL.Tuple(IDL.Principal, UniqueId));
  const Time = IDL.Int;
  const UserMetadata = IDL.Record({
    'epochCreationTime' : Time,
    'preferredDisplayName' : IDL.Text,
    'epochLastUpdateTime' : Time,
    'emailAddress' : IDL.Text,
    'monotonicCreateTodoCount' : IDL.Nat,
  });
  const UsersMetadataStableState = IDL.Vec(IDL.Tuple(UniqueId, UserMetadata));
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
  const UsersTodosStableState = IDL.Vec(IDL.Tuple(UniqueId, IDL.Vec(Todo)));
  const Result_1 = IDL.Variant({
    'ok' : IDL.Tuple(
      PIdContextStableState,
      UsersMetadataStableState,
      UsersTodosStableState,
    ),
    'err' : IDL.Text,
  });
  const Result = IDL.Variant({ 'ok' : IDL.Vec(Todo), 'err' : IDL.Text });
  const anon_class_32_1 = IDL.Service({
    'testTodoCompletion' : IDL.Func([], [], []),
    'test_creation_pidmetadatatodos_editmetadata' : IDL.Func(
        [],
        [Result_1],
        [],
      ),
    'test_todos' : IDL.Func([], [Result], []),
  });
  return anon_class_32_1;
};
export const init = ({ IDL }) => { return []; };
