import {bcrypt} from "bcrypt";
import {jwt} from "jsonwebtoken";
import {mongoose} from "mongoose";

import {doctor} from "../models/doctors";
import {patient} from "../models/patients";
import {clinic} from "../models/clinic";
