module {

  // errors enumerated, to be partitioned like http response codes

  public let AnonUnauthorized: Text = "Users must authenticate to access requested resources";
  public let InvalidScheduleTimes: Text = "Todo cannot be scheduled with a planned start time after planned stop time";
  public let TodoNotFound: Text = "No todo can be found with requested identifer";
  public let ProfileNotFound: Text = "No profile can be found with requested identifier";
};