"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KanbanController = void 0;
const common_1 = require("@nestjs/common");
const kanban_service_1 = require("./kanban.service");
const create_column_dto_1 = require("./dto/create-column.dto");
const create_card_dto_1 = require("./dto/create-card.dto");
const move_card_dto_1 = require("./dto/move-card.dto");
let KanbanController = class KanbanController {
    constructor(kanbanService) {
        this.kanbanService = kanbanService;
    }
    async getBoard() {
        const columns = await this.kanbanService.findAllColumns();
        return { columns };
    }
    async createColumn(createColumnDto) {
        return this.kanbanService.createColumn(createColumnDto);
    }
    async deleteColumn(columnId) {
        return this.kanbanService.deleteColumn(columnId);
    }
    async updateColumnPositions(data) {
        return this.kanbanService.updateColumnPositions(data.columns);
    }
    async createCard(columnId, createCardDto) {
        return this.kanbanService.createCard(columnId, createCardDto);
    }
    async deleteCard(cardId) {
        return this.kanbanService.deleteCard(cardId);
    }
    async moveCard(cardId, moveCardDto) {
        return this.kanbanService.moveCard(cardId, moveCardDto);
    }
    async updateCardPosition(cardId, position) {
        await this.kanbanService.updateCardPosition(cardId, position);
        return { success: true };
    }
};
exports.KanbanController = KanbanController;
__decorate([
    (0, common_1.Get)('board'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], KanbanController.prototype, "getBoard", null);
__decorate([
    (0, common_1.Post)('columns'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_column_dto_1.CreateColumnDto]),
    __metadata("design:returntype", Promise)
], KanbanController.prototype, "createColumn", null);
__decorate([
    (0, common_1.Delete)('columns/:columnId'),
    __param(0, (0, common_1.Param)('columnId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], KanbanController.prototype, "deleteColumn", null);
__decorate([
    (0, common_1.Put)('columns/positions'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], KanbanController.prototype, "updateColumnPositions", null);
__decorate([
    (0, common_1.Post)('columns/:columnId/cards'),
    __param(0, (0, common_1.Param)('columnId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_card_dto_1.CreateCardDto]),
    __metadata("design:returntype", Promise)
], KanbanController.prototype, "createCard", null);
__decorate([
    (0, common_1.Delete)('cards/:cardId'),
    __param(0, (0, common_1.Param)('cardId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], KanbanController.prototype, "deleteCard", null);
__decorate([
    (0, common_1.Put)('cards/:cardId/move'),
    __param(0, (0, common_1.Param)('cardId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, move_card_dto_1.MoveCardDto]),
    __metadata("design:returntype", Promise)
], KanbanController.prototype, "moveCard", null);
__decorate([
    (0, common_1.Put)('cards/:cardId/position'),
    __param(0, (0, common_1.Param)('cardId')),
    __param(1, (0, common_1.Body)('position')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], KanbanController.prototype, "updateCardPosition", null);
exports.KanbanController = KanbanController = __decorate([
    (0, common_1.Controller)('kanban'),
    __metadata("design:paramtypes", [kanban_service_1.KanbanService])
], KanbanController);
//# sourceMappingURL=kanban.controller.js.map