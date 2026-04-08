import { ConsoleAdapter } from '@learning/logger';
import type { ILogger } from '@learning/logger';
import type { IClientRepository } from '../usecases/types/IClientRepository';
import { SupabaseClientRepository } from '../repositories/SupabaseClientRepository';
import { CreateClientUsecase } from '../usecases/createClientUsecase';
import { GetClientsUsecase } from '../usecases/getClientsUsecase';

// Composition Root — único lugar donde se instancian y conectan los servicios.
// Los getters son lazy: solo se instancian la primera vez que se acceden.
// En un proyecto real se usaría @Memoize de lodash-decorators para garantizar
// el singleton. Aquí lo replicamos manualmente para no agregar dependencias.
class ServiceFactory {
  private _logger?: ILogger;
  private _clientRepository?: SupabaseClientRepository;
  private _getClientsUsecase?: GetClientsUsecase;
  private _createClientUsecase?: CreateClientUsecase;

  get logger(): ILogger {
    if (!this._logger) {
      this._logger = new ConsoleAdapter();
    }
    return this._logger;
  }

  private get clientRepository(): IClientRepository {
    if (!this._clientRepository) {
      this._clientRepository = new SupabaseClientRepository();
    }
    return this._clientRepository;
  }

  get getClientsUsecase(): GetClientsUsecase {
    if (!this._getClientsUsecase) {
      this._getClientsUsecase = new GetClientsUsecase(this.clientRepository);
    }
    return this._getClientsUsecase;
  }

  get createClientUsecase(): CreateClientUsecase {
    if (!this._createClientUsecase) {
      this._createClientUsecase = new CreateClientUsecase(this.clientRepository);
    }
    return this._createClientUsecase;
  }
}

// Singleton exportado — la misma instancia se reutiliza en warm starts de Lambda
export const factory = new ServiceFactory();
