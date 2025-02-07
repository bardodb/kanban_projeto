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
exports.KanbanService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const column_entity_1 = require("./entities/column.entity");
const card_entity_1 = require("./entities/card.entity");
let KanbanService = class KanbanService {
    constructor(columnRepository, cardRepository, dataSource) {
        this.columnRepository = columnRepository;
        this.cardRepository = cardRepository;
        this.dataSource = dataSource;
    }
    async findAllColumns() {
        const columns = await this.columnRepository.find({
            order: {
                position: 'ASC',
            },
            relations: ['cards'],
        });
        columns.forEach(column => {
            if (column.cards) {
                column.cards.sort((a, b) => a.position - b.position);
            }
        });
        return columns;
    }
    async createColumn(createColumnDto) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const lastColumn = await queryRunner.manager
                .createQueryBuilder(column_entity_1.Column, "column")
                .orderBy("column.position", "DESC")
                .take(1)
                .getOne();
            const position = lastColumn ? lastColumn.position + 1 : 0;
            const column = queryRunner.manager.create(column_entity_1.Column, {
                ...createColumnDto,
                position,
                cards: []
            });
            const savedColumn = await queryRunner.manager.save(column_entity_1.Column, column);
            await queryRunner.commitTransaction();
            if (!savedColumn.cards) {
                savedColumn.cards = [];
            }
            return savedColumn;
        }
        catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        }
        finally {
            await queryRunner.release();
        }
    }
    async deleteColumn(columnId) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const column = await queryRunner.manager.findOneOrFail(column_entity_1.Column, {
                where: { id: columnId },
                relations: ['cards'],
            });
            if (column.cards.length > 0) {
                await queryRunner.manager.remove(column.cards);
            }
            await queryRunner.manager.remove(column);
            await queryRunner.manager.createQueryBuilder()
                .update(column_entity_1.Column)
                .set({
                position: () => 'position - 1'
            })
                .where('position > :position', { position: column.position })
                .execute();
            await queryRunner.commitTransaction();
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    async createCard(columnId, createCardDto) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const column = await queryRunner.manager.findOneOrFail(column_entity_1.Column, {
                where: { id: columnId }
            });
            const lastCard = await queryRunner.manager
                .createQueryBuilder(card_entity_1.Card, "card")
                .where("card.columnId = :columnId", { columnId })
                .orderBy("card.position", "DESC")
                .take(1)
                .getOne();
            const position = lastCard ? lastCard.position + 1 : 0;
            const card = queryRunner.manager.create(card_entity_1.Card, {
                ...createCardDto,
                columnId,
                column,
                position,
            });
            const savedCard = await queryRunner.manager.save(card_entity_1.Card, card);
            await queryRunner.commitTransaction();
            return savedCard;
        }
        catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        }
        finally {
            await queryRunner.release();
        }
    }
    async deleteCard(cardId) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const card = await queryRunner.manager.findOneOrFail(card_entity_1.Card, {
                where: { id: cardId },
                relations: ['column'],
            });
            const columnId = card.columnId;
            await queryRunner.manager.remove(card);
            await queryRunner.manager
                .createQueryBuilder()
                .update(card_entity_1.Card)
                .set({
                position: () => 'position - 1'
            })
                .where('columnId = :columnId AND position > :position', {
                columnId,
                position: card.position
            })
                .execute();
            await queryRunner.commitTransaction();
        }
        catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        }
        finally {
            await queryRunner.release();
        }
    }
    async moveCard(cardId, moveCardDto) {
        const { fromColumnId, toColumnId } = moveCardDto;
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const card = await queryRunner.manager.findOne(card_entity_1.Card, {
                where: { id: cardId },
                relations: ['column'],
            });
            if (!card) {
                throw new common_1.NotFoundException(`Card with ID ${cardId} not found`);
            }
            if (card.columnId !== fromColumnId) {
                throw new common_1.NotFoundException(`Card ${cardId} is not in column ${fromColumnId}`);
            }
            const oldPosition = card.position;
            await queryRunner.manager.createQueryBuilder()
                .update(card_entity_1.Card)
                .set({
                position: () => 'position - 1'
            })
                .where('columnId = :columnId AND position > :position', {
                columnId: fromColumnId,
                position: oldPosition,
            })
                .execute();
            const lastCardInTarget = await queryRunner.manager.findOne(card_entity_1.Card, {
                where: { columnId: toColumnId },
                order: { position: 'DESC' },
            });
            const newPosition = lastCardInTarget ? lastCardInTarget.position + 1 : 0;
            await queryRunner.manager.update(card_entity_1.Card, cardId, {
                columnId: toColumnId,
                position: newPosition,
            });
            await queryRunner.commitTransaction();
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    async updateColumnPositions(columns) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            for (const column of columns) {
                await queryRunner.manager.update(column_entity_1.Column, column.id, {
                    position: column.position
                });
            }
            await queryRunner.commitTransaction();
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    async updateCardPosition(cardId, newPosition) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const card = await queryRunner.manager.findOne(card_entity_1.Card, {
                where: { id: cardId },
            });
            if (!card) {
                throw new common_1.NotFoundException(`Card with ID ${cardId} not found`);
            }
            await queryRunner.manager.update(card_entity_1.Card, cardId, {
                position: newPosition,
            });
            await queryRunner.commitTransaction();
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
};
exports.KanbanService = KanbanService;
exports.KanbanService = KanbanService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(column_entity_1.Column)),
    __param(1, (0, typeorm_1.InjectRepository)(card_entity_1.Card)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource])
], KanbanService);
//# sourceMappingURL=kanban.service.js.map