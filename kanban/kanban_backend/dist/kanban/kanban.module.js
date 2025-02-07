"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KanbanModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const kanban_controller_1 = require("./kanban.controller");
const kanban_service_1 = require("./kanban.service");
const column_entity_1 = require("./entities/column.entity");
const card_entity_1 = require("./entities/card.entity");
let KanbanModule = class KanbanModule {
};
exports.KanbanModule = KanbanModule;
exports.KanbanModule = KanbanModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([column_entity_1.Column, card_entity_1.Card])],
        controllers: [kanban_controller_1.KanbanController],
        providers: [kanban_service_1.KanbanService],
    })
], KanbanModule);
//# sourceMappingURL=kanban.module.js.map