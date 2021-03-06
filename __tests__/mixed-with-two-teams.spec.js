const GlobalConfiguration = require('../src/core/utils/globalTestConfigurationSetup');
const CommandName = require('./commandName');
const TestFunctions = require('./testFunctions');
const Messages = require('../src/core/messages/messages');
const userId = 'u_mixed2';
const teamId = 't_mixed3';
const userId2 = 'u_mixed4';
const teamId2 = 't_mixed5';
const channelId2 = 'chan2';
const alias1 = 'mixed3';
const alias2 = 'mixed4';

// This test is used for the following scenario:
// 1. team login
// 2. add account 1 with alias mixed1 ('add account' command)
// 3. add account 2 with alias mixed2 ('add account' command)
// 4. run 'accounts' command
// 5. get triggered alerts => mixed1(default)'s triggers
// 6. alias2 get triggered alerts => mixed2's triggers
// 7. set channel account alias2
// 8. get triggered alerts from channel1 => mixed's triggers  (workspace default)
// 8. get triggered alerts from channel2 => mixed2's triggers
// 9. accounts
// 10. remove account alias2 => confirm => yes
// 11. get triggered alerts => mixed1's triggers
// 12. alias2 get triggered alerts => no such alias

describe('Mixed1', () => {
  const globalTestConfiguration = new GlobalConfiguration();
  const channelId = globalTestConfiguration.openChannelId;
  const pageSize = 5;
  const total = 400;
  const total2 = 200;
  const total3 = 100;

  function getTriggers(teamId, channelId) {
    return [
      {
        user: userId,
        channel: channelId,
        team: teamId,
        messages: [
          {
            text: `get triggered alerts`,
            isAssertion: true,
            team: teamId
          }
        ]
      }
    ];
  }

  const triggersResults = [
    {
      alertId: 111,
      name: 'Alert name 111',
      severity: 'MEDIUM'
    },
    {
      alertId: 112,
      name: 'Alert name 112',
      severity: 'LOW'
    },
    {
      alertId: 113,
      name: 'Alert name 113',
      severity: 'MEDIUM'
    },
    {
      alertId: 114,
      name: 'Alert name 114',
      severity: 'MEDIUM'
    },
    {
      alertId: 115,
      name: 'Alert name 115',
      severity: 'MEDIUM'
    }
  ];

  const triggersResults2 = [
    {
      alertId: 211,
      name: 'Alert name 211',
      severity: 'MEDIUM'
    },
    {
      alertId: 212,
      name: 'Alert name 212',
      severity: 'LOW'
    },
    {
      alertId: 213,
      name: 'Alert name 213',
      severity: 'LOW'
    },
    {
      alertId: 214,
      name: 'Alert name 214',
      severity: 'LOW'
    },
    {
      alertId: 215,
      name: 'Alert name 215',
      severity: 'LOW'
    }
  ];

  const triggersResults3 = [
    {
      alertId: 414,
      name: 'Alert name 414',
      severity: 'MEDIUM'
    },
    {
      alertId: 412,
      name: 'Alert name 412',
      severity: 'LOW'
    },
    {
      alertId: 413,
      name: 'Alert name 413',
      severity: 'LOW'
    },
    {
      alertId: 414,
      name: 'Alert name 414',
      severity: 'LOW'
    },
    {
      alertId: 415,
      name: 'Alert name 415',
      severity: 'LOW'
    }
  ];

  const alertsReturnValue = {
    statusCode: 200,
    body: {
      message: 'ok',
      pageSize: pageSize,
      from: 0,
      total: total,
      results: triggersResults
    }
  };

  const alertsReturnValue2 = {
    statusCode: 200,
    body: {
      message: 'ok',
      pageSize: pageSize,
      from: 0,
      total: total2,
      results: triggersResults2
    }
  };

  const alertsReturnValue3 = {
    statusCode: 200,
    body: {
      message: 'ok',
      pageSize: pageSize,
      from: 0,
      total: total3,
      results: triggersResults3
    }
  };

  it('mixed with two teams', done => {
    let sequence = TestFunctions.createOneAccount(
      userId,
      teamId,
      channelId,
      'mixed-1-api-token',
      'us-east-1',
      alias1
    );
    globalTestConfiguration.bot
      .usersInput(sequence)
      .then(message =>
        expect(message.text).toBe(
          `Okay, you\'re ready to use ${alias1} in Slack!`
        )
      )

      .then(() =>
        globalTestConfiguration.bot.usersInput(
          TestFunctions.createOneAccount(
            userId,
            teamId,
            channelId,
            'mixed-2-api-token',
            'us-east-1',
            alias2
          )
        )
      )
      .then(message =>
        expect(message.text).toBe(
          `Okay, you\'re ready to use ${alias2} in Slack!`
        )
      )

      .then(() =>
        globalTestConfiguration.bot.usersInput(
          TestFunctions.createOneAccount(
            userId2,
            teamId2,
            channelId,
            'mixed-3-api-token',
            'us-east-1',
            alias2
          )
        )
      )
      .then(message =>
        expect(message.text).toBe(
          `Okay, you\'re ready to use ${alias2} in Slack!`
        )
      )

      .then(() =>
        globalTestConfiguration.bot.usersInput(
          TestFunctions.getAccounts(userId, teamId, channelId)
        )
      )
      .then(message => {
        expect(message.channel).toBe(channelId);
        expect(message.text).toBe(
          `These are the accounts in this workspace:\n• \`${alias1}\`: Slack alias for Logzio App Test 1 Prod. *This is the default workspace account.*\n• \`${alias2}\`: Slack alias for Logzio App Test 2 Prod.\n`
        );
      })

      .then(() =>
        globalTestConfiguration.bot.usersInput(
          TestFunctions.getAccounts(userId2, teamId2, channelId)
        )
      )
      .then(message => {
        expect(message.channel).toBe(channelId);
        expect(message.text).toBe(
          `These are the accounts in this workspace:\n• \`${alias2}\`: Slack alias for Team2 App Test Prod. *This is the default workspace account.*\n`
        );
      })
      .then(() =>
        globalTestConfiguration.bot.usersInput(getTriggers(teamId, channelId))
      )
      .then(alertMessage =>
        TestFunctions.validateTriggeredResults(alertMessage, alertsReturnValue)
      )

      .then(() =>
        globalTestConfiguration.bot.usersInput(getTriggers(teamId2, channelId))
      )
      .then(alertMessage =>
        TestFunctions.validateTriggeredResults(alertMessage, alertsReturnValue3)
      )

      .then(() =>
        globalTestConfiguration.bot.usersInput(
          TestFunctions.aliaGetTriggers(userId, teamId, channelId, alias2)
        )
      )
      .then(alertMessage =>
        TestFunctions.validateTriggeredResults(alertMessage, alertsReturnValue2)
      )

      .then(() =>
        globalTestConfiguration.bot.usersInput(
          TestFunctions.setChannelAccount(userId, teamId, channelId2, alias2)
        )
      )
      .then(message => {
        expect(message.text).toBe(
          `Okay, '${alias2}' is the channel account now.`
        );
      })
      .then(() =>
        globalTestConfiguration.bot.usersInput(getTriggers(teamId, channelId))
      )
      .then(alertMessage =>
        TestFunctions.validateTriggeredResults(alertMessage, alertsReturnValue)
      )
      .then(() =>
        globalTestConfiguration.bot.usersInput(getTriggers(teamId, channelId2))
      )
      .then(alertMessage =>
        TestFunctions.validateTriggeredResults(alertMessage, alertsReturnValue2)
      )
      .then(() =>
        globalTestConfiguration.bot.usersInput(
          TestFunctions.getAccounts(userId, teamId, channelId)
        )
      )
      .then(message => {
        expect(message.channel).toBe(channelId);
        expect(message.text).toBe(
          'These are the accounts in this workspace:\n' +
            `• \`${alias1}\`: Slack alias for Logzio App Test 1 Prod. *This is the default workspace account.*\n` +
            `• \`${alias2}\`: Slack alias for Logzio App Test 2 Prod. This is the channel account for <#${channelId2}|${channelId2}_name>.\n`
        );
      })

      .then(() =>
        globalTestConfiguration.bot.usersInput(
          TestFunctions.removeAccount(userId, teamId, alias2, channelId)
        )
      )
      .then(message => {
        expect(message.attachments[0].text).toBe(
          `${alias2} is used in these channels: <#${channelId2}|${channelId2}_name>. Are you sure you want to remove it from Slack?`
        );
      })
      .then(() => {
        globalTestConfiguration.bot
          .usersInput(
            TestFunctions.confirm(userId, teamId, alias2, channelId, 'remove-yes')
          )
          .then(message => {
            expect(message.text).toBe(`Okay, I removed ${alias2} from Slack.`);
            globalTestConfiguration.bot
              .usersInput(
                TestFunctions.aliaGetTriggers(userId, teamId, channelId, alias2)
              )
              .then(message => {
                expect(message.text).toBe(
                  "Sorry, there isn't an account with that alias. If you want to see your accounts, type `@Alice accounts`."
                );
                done();
              });
          });
      });
  });

  beforeAll(async done => {
    var handlers = [
      {
        method: 'post',
        url: '/v1/alerts/triggered-alerts',
        handlerName: 'alerts'
      }
    ];
    const handlersReturnValues = new Object();
    handlersReturnValues['alerts'] = {};
    handlersReturnValues['alerts']['mixed-1-api-token'] = alertsReturnValue;
    handlersReturnValues['alerts']['mixed-2-api-token'] = alertsReturnValue2;
    handlersReturnValues['alerts']['mixed-3-api-token'] = alertsReturnValue3;

    await globalTestConfiguration.beforeAll(
      handlers,
      handlersReturnValues,
      true
    );
    await globalTestConfiguration.mockFirstInstall(
      teamId,
      userId,
      'Logz.io Mixed1',
      'us-east-1',
      'xoxb-357770700357',
      'xoxp-8241711843-408',
      'mixed-1-api-token'
    );
    await globalTestConfiguration.mockFirstInstall(
      teamId2,
      userId2,
      'Test2 Mixed1',
      'us-east-1',
      'xoxb-357770700357',
      'xoxp-8241711843-408',
      'mixed-3-api-token'
    );
    done();
  });

  beforeEach(async (done) => {
    const kibanaClient = globalTestConfiguration.createKibanaClientMock([]);
    await globalTestConfiguration.initBeforeEach(
      kibanaClient,
      CommandName.SETUP
    );
    done();
  });

  afterAll(async done => {
    globalTestConfiguration.afterAll(done);
  });
  afterEach(async (done) => {
    globalTestConfiguration.afterEach(done);
  });
});
