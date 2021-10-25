import {CommonActionTypes} from './actions/Common.action';
import {SettingsActionTypes} from './actions/Settings.action';
import {DashboardActionTypes} from './actions/Dashboard.action';
import {UpdateAuthUserActions} from './actions/Auth.actions';

export interface LineData {
  date: string;
  primary: number;
  secondary?: number;
  tertiary?: number;
}

export type AppActions =
  | CommonActionTypes
  | SettingsActionTypes
  | DashboardActionTypes
  | UpdateAuthUserActions;
