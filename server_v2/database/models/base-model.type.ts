export type BaseModel = {
  id: number;
  createdAtUtc: Date;
  updatedAtUtc: Date;
};

export type AuditedBaseModel = BaseModel & {
  auditedBy: number;
};
