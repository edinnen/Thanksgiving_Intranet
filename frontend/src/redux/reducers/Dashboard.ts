import {
  DashboardActionTypes,
  GET_ANALYTICS_DATA,
  GET_CRM_DATA,
  GET_CRYPTO_DATA,
  GET_HISTORICAL_DATA,
  GET_METRICS_DATA,
  GET_WIDGETS_DATA,
} from '../../types/actions/Dashboard.action';
import {Metrics} from '../../types/models/Metrics';
import {Analytics} from '../../types/models/Analytics';
import {CRM} from '../../types/models/CRM';
import {Crypto} from '../../types/models/Crypto';
import {Widgets} from '../../types/models/Widgets';
import {Reading} from '../../types/models/Power';

const initialState: {
  analyticsData: Analytics | null;
  crmData: CRM | null;
  cryptoData: Crypto | null;
  metricsData: Metrics | null;
  widgetsData: Widgets | null;
  historicalData: Reading[] | null;
} = {
  analyticsData: null,
  crmData: null,
  cryptoData: null,
  metricsData: null,
  widgetsData: null,
  historicalData: null,
};

export default (state = initialState, action: DashboardActionTypes) => {
  switch (action.type) {
    case GET_ANALYTICS_DATA:
      return {
        ...state,
        analyticsData: action.payload,
      };
    case GET_CRM_DATA:
      return {
        ...state,
        crmData: action.payload,
      };

    case GET_CRYPTO_DATA:
      return {
        ...state,
        cryptoData: action.payload,
      };

    case GET_METRICS_DATA:
      return {
        ...state,
        metricsData: action.payload,
      };

    case GET_WIDGETS_DATA:
      return {
        ...state,
        widgetsData: action.payload,
      };

    case GET_HISTORICAL_DATA:

      return {
        ...state,
        historicalData: action.payload,
      };

    default:
      return state;
  }
};
