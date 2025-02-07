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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Column = void 0;
const typeorm_1 = require("typeorm");
const card_entity_1 = require("./card.entity");
let Column = class Column {
};
exports.Column = Column;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Column.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Column.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', default: 0 }),
    __metadata("design:type", Number)
], Column.prototype, "position", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => card_entity_1.Card, card => card.column, {
        cascade: true
    }),
    __metadata("design:type", Array)
], Column.prototype, "cards", void 0);
exports.Column = Column = __decorate([
    (0, typeorm_1.Entity)()
], Column);
//# sourceMappingURL=column.entity.js.map