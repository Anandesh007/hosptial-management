import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {DoctorLeave, DoctorLeaveRelations} from '../models';

export class DoctorLeaveRepository extends DefaultCrudRepository<
  DoctorLeave,
  typeof DoctorLeave.prototype.id,
  DoctorLeaveRelations
> {
  constructor(
    @inject('datasources.db') dataSource: DbDataSource,
  ) {
    super(DoctorLeave, dataSource);
  }
}
