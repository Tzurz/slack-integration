const Command = require('../../core/commands/command');
const commandRegex = /clear workspace account/;
const LoggerFactory = require('../../core/logging/logger-factory');
const { getEventMetadata } = require('../../core/logging/logging-metadata');
const { logEvent } = require('../../core/logging/logging-service');
const logger = LoggerFactory.getLogger(__filename);
const Messages = require('../../core/messages/messages');

class ClearWorkspaceAccountCommand extends Command {
  constructor(defaultHandler) {
    super();
    this.defaultHandler = defaultHandler;
    this.teamConfigurationService = defaultHandler.teamConfigService;
  }

  configure(controller) {
    controller.hears(
      [commandRegex],
      'direct_message,direct_mention',
      (bot, message) => {
        this.reportCommand(message);
        this.defaultHandler
          .clearDefault(message.team)
          .then(() => {
            bot.reply(message, `Okay, I cleared the workspace account.`);
          })
          .catch(err => {
            this.handleError(bot, message, err, err => {
              logger.warn(
                'Failed to clear workspace account',
                err,
                getEventMetadata({
                  message,
                  eventName: 'failed-to-clear-workspace-account'
                })
              );
              bot.reply(message, Messages.DEFAULT_ERROR_MESSAGE);
            });
          });
      }
    );
  }

  async reportCommand(userObject) {
    const companyName = await this.teamConfigurationService.getCompanyNameForTeamId(
      userObject.team
    );
    logEvent({
      userObject,
      logger,
      companyName,
      eventName: 'clear-default-account',
      action: 'triggered the clear default account command'
    });
  }

  getCategory() {
    return 'defaults';
  }

  getUsage() {
    return [
      // '*clear workspace account* - Clear the default account for this workspace'
    ];
  }
}

module.exports = ClearWorkspaceAccountCommand;
