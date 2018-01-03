import { pathOr } from 'ramda';
import { SqsParallel, Config } from 'sqs-parallel';

export interface ActionMapCondition {
  path: string;
  value: string;
}

export interface SendMessageFunction {
  (data: any): Promise<any>;
}

export interface ActionMapFunction {
  (eventObj: any, sendMessage: SendMessageFunction): boolean;
}

export interface ActionMapItem {
  conditions: ActionMapCondition[];
  action: ActionMapFunction;
}

export class QueueProcessor {
  private __queue: SqsParallel;
  private __map: ActionMapItem[];
  private __options: Config;

  constructor(options: Config, map: ActionMapItem[]) {
    this.__options = options;
    this.__map = map;
  }

  start() {
    this.__queue = new SqsParallel({
      ...this.__options,
      debug:
        typeof this.__options.debug !== 'boolean'
          ? process.env.NODE_ENV === 'development'
          : this.__options.debug
    });
    this.__queue.on('message', message => this.processMessage(message));
    this.__queue.on('error', err => this.handleError(err));
  }

  processMessage(message: any) {
    const processorFn = this.findActionProcessor(message.data);
    if (processorFn) {
      return processorFn(message.data, body => this.sendMessage(body));
    }
    this.handleError(new Error('Processor not found for message'));
  }

  handleError(err: any) {
    // @TODO: hook up a logger
    console.error(err);
  }

  findActionProcessor(message: any): ActionMapFunction | undefined {
    const item = this.__map.find(mapItem => {
      return mapItem.conditions.every(
        condition =>
          pathOr(null, condition.path.split('.'), message) === condition.value
      );
    });
    if (item) {
      return item.action;
    }
    return;
  }

  sendMessage(body: any): Promise<any> {
    return this.__queue.sendMessage({
      body
    });
  }
}

export function createQueueProcessor(
  queueOptions: Config,
  map: ActionMapItem[]
) {
  return new QueueProcessor(queueOptions, map);
}
