'use strict'

module.exports = require('protons')(`

message ARQL {
  string op = 1;

  ARQL e1 = 2;
  string p1 = 3;

  ARQL e2 = 4;
  string p2 = 5;
}

message ARQLReq {
  ARQL query = 1;
}

message ARQLRes {
  repeated TX txs = 2;
}

message FetchReq {
  bytes id = 1;
}

message FetchRes {
  TX tx = 1;
}

message Tag {
  bytes name = 1;
  bytes value = 2;
}

message TX {
  bytes id = 1;
  bytes last_tx = 2;
  string owner = 3;

  repeated Tag tags = 4;

  string target = 5;
  string quantity = 6;

  bytes data = 7;
  string reward = 8;
  bytes signature = 9;
}

`)
