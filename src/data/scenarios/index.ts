import type { Scenario } from "../../types/scenario";

import { net1042 } from "./net-1042";
import { net1043 } from "./net-1043";
import { net1044 } from "./net-1044";
import { net1045 } from "./net-1045";
import { net1046 } from "./net-1046";
import { net1047 } from "./net-1047";
import { net1048 } from "./net-1048";
import { net1049 } from "./net-1049";
import { net1050 } from "./net-1050";
import { net1051 } from "./net-1051";
import { net1052 } from "./net-1052";
import { net1053 } from "./net-1053";
import { net1054 } from "./net-1054";

import { win2001 } from "./win-2001";
import { win2002 } from "./win-2002";
import { win2003 } from "./win-2003";
import { win2004 } from "./win-2004";
import { win2005 } from "./win-2005";
import { win2006 } from "./win-2006";
import { win2007 } from "./win-2007";
import { win2008 } from "./win-2008";
import { win2009 } from "./win-2009";

import { hw3001 } from "./hw-3001";
import { hw3002 } from "./hw-3002";
import { hw3003 } from "./hw-3003";
import { hw3004 } from "./hw-3004";
import { hw3005 } from "./hw-3005";
import { hw3006 } from "./hw-3006";
import { hw3007 } from "./hw-3007";

import { gen4001 } from "./gen-4001";
import { gen4002 } from "./gen-4002";
import { gen4003 } from "./gen-4003";
import { gen4004 } from "./gen-4004";
import { gen4005 } from "./gen-4005";
import { gen4006 } from "./gen-4006";

import { sec5001 } from "./sec-5001";
import { sec5002 } from "./sec-5002";
import { sec5003 } from "./sec-5003";
import { sec5004 } from "./sec-5004";
import { sec5005 } from "./sec-5005";

// Adding a new ticket means writing one data file and adding it here.
// Nothing in the engine or UI needs to change.
export const scenarios: Scenario[] = [
  net1042, net1043, net1044, net1045, net1046, net1047, net1048, net1049, net1050, net1051, net1052, net1053, net1054,
  win2001, win2002, win2003, win2004, win2005, win2006, win2007, win2008, win2009,
  hw3001, hw3002, hw3003, hw3004, hw3005, hw3006, hw3007,
  gen4001, gen4002, gen4003, gen4004, gen4005, gen4006,
  sec5001, sec5002, sec5003, sec5004, sec5005,
];

export function getScenario(id: string): Scenario | undefined {
  return scenarios.find((s) => s.id === id);
}
