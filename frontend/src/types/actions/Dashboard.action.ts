import {Metrics} from '../models/Metrics';
import {Analytics} from '../models/Analytics';
import {CRM} from '../models/CRM';
import {Crypto} from '../models/Crypto';
import {Widgets} from '../models/Widgets';
import {Reading} from '../models/Power';

export const GET_ANALYTICS_DATA = 'GET_ANALYTICS_DATA';
export const GET_CRM_DATA = 'GET_CRM_DATA';
export const GET_CRYPTO_DATA = 'GET_CRYPTO_DATA';
export const GET_METRICS_DATA = 'GET_METRICS_DATA';
export const GET_WIDGETS_DATA = 'GET_WIDGETS_DATA';
export const GET_HISTORICAL_DATA = 'GET_HISTORICAL_DATA';

export interface GetAnalyticsAction {
  type: typeof GET_ANALYTICS_DATA;
  payload: Analytics;
}

export interface GetCRMAction {
  type: typeof GET_CRM_DATA;
  payload: CRM;
}

export interface GetCryptosAction {
  type: typeof GET_CRYPTO_DATA;
  payload: Crypto;
}

export interface GetMetricsAction {
  type: typeof GET_METRICS_DATA;
  payload: Metrics;
}

export interface GetWidgetsAction {
  type: typeof GET_WIDGETS_DATA;
  payload: Widgets;
}

export interface GetHistoricalAction {
  type: typeof GET_HISTORICAL_DATA;
  payload: Reading[];
}

export type DashboardActionTypes =
  | GetAnalyticsAction
  | GetCRMAction
  | GetCryptosAction
  | GetMetricsAction
  | GetWidgetsAction
  | GetHistoricalAction;
