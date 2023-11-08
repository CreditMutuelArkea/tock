import { Component, Input, OnInit } from '@angular/core';
import { EntityProvider } from '../sentence-training-list/sentence-training-sentence/sentence-training-sentence.component';
import { EntityType, entityNameFromQualifiedName, qualifiedNameWithoutRole } from '../../../../model/nlp';
import { NbDialogRef } from '@nebular/theme';
import { StateService } from '../../../../core-nlp/state.service';

@Component({
  selector: 'tock-entity-creation',
  templateUrl: './entity-creation.component.html',
  styleUrls: ['./entity-creation.component.scss']
})
export class EntityCreationComponent {
  @Input() entityProvider: EntityProvider;
  entityType: EntityType;
  type: string;
  role: string;

  roleInitialized: boolean;

  error: string;
  entityTypes: EntityType[];

  constructor(public dialogRef: NbDialogRef<EntityCreationComponent>, private state: StateService) {
    this.state.entityTypesSortedByName().subscribe((entities) => (this.entityTypes = entities));
  }

  onSelect(entityType: EntityType) {
    this.entityType = entityType;
    this.type = qualifiedNameWithoutRole(this.state.user, entityType.name);
    this.role = entityNameFromQualifiedName(entityType.name);
    this.roleInitialized = true;
  }

  onTypeKeyUp(event) {
    if (this.type) {
      this.type = this.type
        .replace(/[^A-Za-z:_-]*/g, '')
        .toLowerCase()
        .trim();
      if (!this.roleInitialized) {
        this.role = this.type;
      }
    }
  }

  onRoleKeyUp(event) {
    this.roleInitialized = true;
    if (this.role) {
      this.role = this.role
        .replace(/[^A-Za-z_-]*/g, '')
        .toLowerCase()
        .trim();
    }
  }

  save() {
    this.onTypeKeyUp(null);
    this.onRoleKeyUp(null);
    this.error = undefined;
    let name = this.type;
    if (!name || name.length === 0) {
      if (this.entityType) {
        name = this.entityType.name;
      } else {
        this.error = 'Please select or create an entity';
        return;
      }
    } else if (name.indexOf(':') === -1) {
      name = `${this.state.user.organization}:${name}`;
    }
    let role = this.role;
    if (!role || role.length === 0) {
      role = entityNameFromQualifiedName(name);
    }
    if (this.entityProvider && this.entityProvider.hasEntityRole(role)) {
      this.error = 'Entity role already exists';
    } else {
      this.dialogRef.close({ name: name, role: role });
    }
  }
}
