# Backend code for the Black Relay Web App.

![](./img/backend-diag.excalidraw.svg)

## Generating Swagger Docs

```
npx swagger-cli bundle swagger/swagger.yaml --outfile ./swagger.yaml --type yaml
```

## ERD

```mermaid
erDiagram
    users ||--o{ rbacGroups : "belongs to"
    rbacGroups ||--o{ users : "has members"
    events }o--|| topics : "references"

    users {
        ObjectId _id PK
        String username UK "required, unique"
        String password "required, bcrypt hashed"
        String firstName
        String lastName
        ObjectId[] groups FK "references rbacGroups"
        Date createdAt "immutable, default now"
    }

    rbacGroups {
        ObjectId _id PK
        String rbacGroupName UK "required, unique"
        ObjectId members FK "references users"
        Date createdAt "immutable, default now"
    }

    events {
        ObjectId _id PK
        String category "enum: DETECT, ALERT, ALARM, THREAT"
        String topic "required, references topic name"
        Object data "flexible JSON sensor payload"
        Boolean acknowledged "default false"
        Date createdAt "auto-generated"
        Date updatedAt "auto-generated"
    }

    topics {
        ObjectId _id PK
        String topicName UK "required, unique"
        Date createdAt "auto-generated"
        Date updatedAt "auto-generated"
    }
```

**Schema Details:**

- **users**: User accounts for platform access. Linked to rbacGroups for role-based permissions (admin/analyst).
- **rbacGroups**: Role definitions (e.g., admin, analyst). Controls access levels and permissions.
- **events**: Sensor event data received via MQTT. Category indicates escalation level. Data field contains flexible sensor-specific JSON payload.
- **topics**: MQTT topic registry. Backend subscribes to topics and automatically stores incoming messages as events.
