---
name: mongodb-mongoose-data-modeling
description: >-
  Best practices for MongoDB schema design with Mongoose in NestJS, indexing strategies, geospatial queries,
  and transaction safety.
---

# MongoDB & Mongoose Data Modeling

Use this skill when designing schemas, writing complex aggregations, handling geospatial queries (e.g., finding nearby clinics), and optimizing MongoDB performance.

---

## 1. Schema Design & Best Practices

- **TypeScript Definitions**: Use `@Schema({ timestamps: true })` and `SchemaFactory.createForClass()`.
- **Geospatial Indexing for Location Queries**:
  - For clinics and emergency requests, store coordinates as GeoJSON Point:
    ```typescript
    @Prop({
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    })
    location: { type: string; coordinates: number[] };
    ```
  - Always create a `2dsphere` index:
    ```typescript
    ClinicSchema.index({ location: '2dsphere' });
    ```
- **Compound & Query Indexes**:
  - Index frequently queried fields (e.g., status + createdAt, clinicId + date).

---

## 2. Safe Transactions & In-Memory Testing

- **ACID Transactions**:
  - When updating multiple related collections (e.g., assigning an emergency triage to a clinic and reserving a slot), use MongoDB sessions (`client.startSession()`).
- **In-Memory Testing**:
  - Use `mongodb-memory-server` for isolated unit and integration tests without connecting to a live cluster.
