import mock from '../../MockConfig';
import analytics from '../../db/dashboard/analytics';
import crm from '../../db/dashboard/crm';
import crypto from '../../db/dashboard/crypto';
import metrics from '../../db/dashboard/metrics';
import widgets from '../../db/dashboard/widgets';

// Define all mocks of dashboard
mock.onGet('/dashboard/analytics').reply(200, analytics);

mock.onGet('/dashboard/crm').reply(200, crm);

mock.onGet('/dashboard/crypto').reply(200, crypto);

mock.onGet('/dashboard/metrics').reply(200, metrics);

mock.onGet('/dashboard/widgets').reply(200, widgets);
