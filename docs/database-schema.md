# AETCH Database Schema

> Auto-generated on 2026-03-14

---

## Models

- [Account](#account)
- [Session](#session)
- [VerificationToken](#verificationtoken)
- [User](#user)
- [Artist](#artist)
- [Shop](#shop)
- [ShopArtist](#shopartist)
- [Tattoo](#tattoo)
- [SavedTattoo](#savedtattoo)
- [Post](#post)
- [Comment](#comment)
- [Review](#review)
- [Booking](#booking)
- [ArtistAvailability](#artistavailability)
- [Notification](#notification)
- [Follower](#follower)
- [AIGeneration](#aigeneration)
- [TattooPreview](#tattoopreview)
- [Like](#like)
- [Conversation](#conversation)
- [ConversationParticipant](#conversationparticipant)
- [Message](#message)

## Enums

- [UserRole](#userrole)
- [ShopArtistRole](#shopartistrole)
- [TattooStyle](#tattoostyle)
- [ColorType](#colortype)
- [BookingStatus](#bookingstatus)
- [NotificationType](#notificationtype)
- [AIGenerationStatus](#aigenerationstatus)

---

### Account

| Field             | Type | Required | Attributes                                                           |
| ----------------- | ---- | -------- | -------------------------------------------------------------------- |
| id                | S    | Yes      | tring @id @default(cuid())                                           |
| userId            | S    | Yes      | tring                                                                |
| type              | S    | Yes      | tring                                                                |
| provider          | S    | Yes      | tring                                                                |
| providerAccountId | S    | Yes      | tring                                                                |
| refresh_token     | S    | Yes      | tring? @db.Text                                                      |
| access_token      | S    | Yes      | tring? @db.Text                                                      |
| expires_at        | I    | Yes      | nt?                                                                  |
| token_type        | S    | Yes      | tring?                                                               |
| scope             | S    | Yes      | tring?                                                               |
| id_token          | S    | Yes      | tring? @db.Text                                                      |
| session_state     | S    | Yes      | tring?                                                               |
| user              | U    | Yes      | ser @relation(fields: [userId], references: [id], onDelete: Cascade) |

**Indexes:**

- `@@unique([provider, providerAccountId])`
- `@@index([userId])`

**Relations:**

- user → U

### Session

| Field        | Type | Required | Attributes                                                           |
| ------------ | ---- | -------- | -------------------------------------------------------------------- |
| id           | S    | Yes      | tring @id @default(cuid())                                           |
| sessionToken | S    | Yes      | tring @unique                                                        |
| userId       | S    | Yes      | tring                                                                |
| expires      | D    | Yes      | ateTime                                                              |
| user         | U    | Yes      | ser @relation(fields: [userId], references: [id], onDelete: Cascade) |

**Indexes:**

- `@@index([userId])`

**Relations:**

- user → U

### VerificationToken

| Field      | Type | Required | Attributes    |
| ---------- | ---- | -------- | ------------- |
| identifier | S    | Yes      | tring         |
| token      | S    | Yes      | tring @unique |
| expires    | D    | Yes      | ateTime       |

**Indexes:**

- `@@unique([identifier, token])`

### User

| Field              | Type | Required | Attributes                       |
| ------------------ | ---- | -------- | -------------------------------- |
| id                 | S    | Yes      | tring @id @default(cuid())       |
| name               | S    | Yes      | tring?                           |
| email              | S    | Yes      | tring? @unique                   |
| emailVerified      | D    | Yes      | ateTime?                         |
| image              | S    | Yes      | tring?                           |
| bio                | S    | Yes      | tring? @db.Text                  |
| username           | S    | Yes      | tring? @unique                   |
| roles              | U    | Yes      | serRole[] @default([USER])       |
| onboardingComplete | B    | Yes      | oolean @default(false)           |
| favoriteStyles     | S    | Yes      | tring[]                          |
| createdAt          | D    | Yes      | ateTime @default(now())          |
| updatedAt          | D    | Yes      | ateTime @updatedAt               |
| accounts           | A    | Yes      | ccount[]                         |
| sessions           | S    | Yes      | ession[]                         |
| artist             | A    | Yes      | rtist?                           |
| posts              | P    | Yes      | ost[]                            |
| comments           | C    | Yes      | omment[]                         |
| reviews            | R    | Yes      | eview[]                          |
| bookings           | B    | Yes      | ooking[]                         |
| likes              | L    | Yes      | ike[]                            |
| savedTattoos       | S    | Yes      | avedTattoo[]                     |
| followers          | F    | Yes      | ollower[] @relation("Following") |
| following          | F    | Yes      | ollower[] @relation("Followers") |
| notifications      | N    | Yes      | otification[]                    |
| aiGenerations      | A    | Yes      | IGeneration[]                    |
| tattooPreviews     | T    | Yes      | attooPreview[]                   |
| conversations      | C    | Yes      | onversationParticipant[]         |
| sentMessages       | M    | Yes      | essage[]                         |

**Indexes:**

- `@@index([email])`
- `@@index([username])`

**Relations:**

- followers → F
- following → F

### Artist

| Field        | Type | Required | Attributes                                                           |
| ------------ | ---- | -------- | -------------------------------------------------------------------- |
| id           | S    | Yes      | tring @id @default(cuid())                                           |
| userId       | S    | Yes      | tring @unique                                                        |
| displayName  | S    | Yes      | tring                                                                |
| slug         | S    | Yes      | tring @unique                                                        |
| bio          | S    | Yes      | tring? @db.Text                                                      |
| specialties  | S    | Yes      | tring[]                                                              |
| hourlyRate   | D    | Yes      | ecimal? @db.Decimal(10, 2)                                           |
| currency     | S    | Yes      | tring @default("USD")                                                |
| location     | S    | Yes      | tring?                                                               |
| latitude     | F    | Yes      | loat?                                                                |
| longitude    | F    | Yes      | loat?                                                                |
| website      | S    | Yes      | tring?                                                               |
| instagram    | S    | Yes      | tring?                                                               |
| verified     | B    | Yes      | oolean @default(false)                                               |
| createdAt    | D    | Yes      | ateTime @default(now())                                              |
| updatedAt    | D    | Yes      | ateTime @updatedAt                                                   |
| user         | U    | Yes      | ser @relation(fields: [userId], references: [id], onDelete: Cascade) |
| shop         | S    | Yes      | hop? @relation(fields: [shopId], references: [id])                   |
| shopId       | S    | Yes      | tring?                                                               |
| tattoos      | T    | Yes      | attoo[]                                                              |
| bookings     | B    | Yes      | ooking[]                                                             |
| reviews      | R    | Yes      | eview[]                                                              |
| availability | A    | Yes      | rtistAvailability[]                                                  |
| shopArtists  | S    | Yes      | hopArtist[]                                                          |

**Indexes:**

- `@@index([userId])`
- `@@index([slug])`
- `@@index([shopId])`
- `@@index([location])`

**Relations:**

- user → U
- shop → S

### Shop

| Field       | Type | Required | Attributes                 |
| ----------- | ---- | -------- | -------------------------- |
| id          | S    | Yes      | tring @id @default(cuid()) |
| name        | S    | Yes      | tring                      |
| slug        | S    | Yes      | tring @unique              |
| description | S    | Yes      | tring? @db.Text            |
| address     | S    | Yes      | tring?                     |
| city        | S    | Yes      | tring?                     |
| state       | S    | Yes      | tring?                     |
| country     | S    | Yes      | tring?                     |
| zipCode     | S    | Yes      | tring?                     |
| latitude    | F    | Yes      | loat?                      |
| longitude   | F    | Yes      | loat?                      |
| phone       | S    | Yes      | tring?                     |
| email       | S    | Yes      | tring?                     |
| website     | S    | Yes      | tring?                     |
| image       | S    | Yes      | tring?                     |
| coverImage  | S    | Yes      | tring?                     |
| verified    | B    | Yes      | oolean @default(false)     |
| ownerId     | S    | Yes      | tring                      |
| createdAt   | D    | Yes      | ateTime @default(now())    |
| updatedAt   | D    | Yes      | ateTime @updatedAt         |
| artists     | A    | Yes      | rtist[]                    |
| shopArtists | S    | Yes      | hopArtist[]                |
| bookings    | B    | Yes      | ooking[]                   |
| reviews     | R    | Yes      | eview[]                    |

**Indexes:**

- `@@index([slug])`
- `@@index([city])`
- `@@index([ownerId])`

### ShopArtist

| Field     | Type | Required | Attributes                                                               |
| --------- | ---- | -------- | ------------------------------------------------------------------------ |
| id        | S    | Yes      | tring @id @default(cuid())                                               |
| shopId    | S    | Yes      | tring                                                                    |
| artistId  | S    | Yes      | tring                                                                    |
| role      | S    | Yes      | hopArtistRole @default(ARTIST)                                           |
| createdAt | D    | Yes      | ateTime @default(now())                                                  |
| shop      | S    | Yes      | hop @relation(fields: [shopId], references: [id], onDelete: Cascade)     |
| artist    | A    | Yes      | rtist @relation(fields: [artistId], references: [id], onDelete: Cascade) |

**Indexes:**

- `@@unique([shopId, artistId])`
- `@@index([shopId])`
- `@@index([artistId])`

**Relations:**

- shop → S
- artist → A

### Tattoo

| Field         | Type | Required | Attributes                                                               |
| ------------- | ---- | -------- | ------------------------------------------------------------------------ |
| id            | S    | Yes      | tring @id @default(cuid())                                               |
| title         | S    | Yes      | tring                                                                    |
| slug          | S    | Yes      | tring @unique                                                            |
| description   | S    | Yes      | tring? @db.Text                                                          |
| imageUrl      | S    | Yes      | tring                                                                    |
| thumbnailUrl  | S    | Yes      | tring?                                                                   |
| blurDataUrl   | S    | Yes      | tring?                                                                   |
| styles        | T    | Yes      | attooStyle[]                                                             |
| bodyPlacement | S    | Yes      | tring?                                                                   |
| colorType     | C    | Yes      | olorType @default(COLOR)                                                 |
| width         | F    | Yes      | loat?                                                                    |
| height        | F    | Yes      | loat?                                                                    |
| likesCount    | I    | Yes      | nt @default(0)                                                           |
| viewsCount    | I    | Yes      | nt @default(0)                                                           |
| artistId      | S    | Yes      | tring                                                                    |
| createdAt     | D    | Yes      | ateTime @default(now())                                                  |
| updatedAt     | D    | Yes      | ateTime @updatedAt                                                       |
| artist        | A    | Yes      | rtist @relation(fields: [artistId], references: [id], onDelete: Cascade) |
| posts         | P    | Yes      | ost[]                                                                    |
| likes         | L    | Yes      | ike[]                                                                    |
| savedBy       | S    | Yes      | avedTattoo[]                                                             |

**Indexes:**

- `@@index([artistId])`
- `@@index([bodyPlacement])`
- `@@index([createdAt])`

**Relations:**

- artist → A

### SavedTattoo

| Field     | Type | Required | Attributes                                                               |
| --------- | ---- | -------- | ------------------------------------------------------------------------ |
| id        | S    | Yes      | tring @id @default(cuid())                                               |
| userId    | S    | Yes      | tring                                                                    |
| tattooId  | S    | Yes      | tring                                                                    |
| createdAt | D    | Yes      | ateTime @default(now())                                                  |
| user      | U    | Yes      | ser @relation(fields: [userId], references: [id], onDelete: Cascade)     |
| tattoo    | T    | Yes      | attoo @relation(fields: [tattooId], references: [id], onDelete: Cascade) |

**Indexes:**

- `@@unique([userId, tattooId])`
- `@@index([userId])`
- `@@index([tattooId])`

**Relations:**

- user → U
- tattoo → T

### Post

| Field         | Type | Required | Attributes                                                             |
| ------------- | ---- | -------- | ---------------------------------------------------------------------- |
| id            | S    | Yes      | tring @id @default(cuid())                                             |
| caption       | S    | Yes      | tring? @db.Text                                                        |
| imageUrl      | S    | Yes      | tring?                                                                 |
| tags          | S    | Yes      | tring[]                                                                |
| authorId      | S    | Yes      | tring                                                                  |
| tattooId      | S    | Yes      | tring?                                                                 |
| likesCount    | I    | Yes      | nt @default(0)                                                         |
| commentsCount | I    | Yes      | nt @default(0)                                                         |
| createdAt     | D    | Yes      | ateTime @default(now())                                                |
| updatedAt     | D    | Yes      | ateTime @updatedAt                                                     |
| author        | U    | Yes      | ser @relation(fields: [authorId], references: [id], onDelete: Cascade) |
| tattoo        | T    | Yes      | attoo? @relation(fields: [tattooId], references: [id])                 |
| comments      | C    | Yes      | omment[]                                                               |
| likes         | L    | Yes      | ike[]                                                                  |

**Indexes:**

- `@@index([authorId])`
- `@@index([tattooId])`
- `@@index([createdAt])`
- `@@index([likesCount])`

**Relations:**

- author → U
- tattoo → T

### Comment

| Field     | Type | Required | Attributes                                                                |
| --------- | ---- | -------- | ------------------------------------------------------------------------- |
| id        | S    | Yes      | tring @id @default(cuid())                                                |
| content   | S    | Yes      | tring @db.Text                                                            |
| authorId  | S    | Yes      | tring                                                                     |
| postId    | S    | Yes      | tring                                                                     |
| parentId  | S    | Yes      | tring?                                                                    |
| createdAt | D    | Yes      | ateTime @default(now())                                                   |
| updatedAt | D    | Yes      | ateTime @updatedAt                                                        |
| author    | U    | Yes      | ser @relation(fields: [authorId], references: [id], onDelete: Cascade)    |
| post      | P    | Yes      | ost @relation(fields: [postId], references: [id], onDelete: Cascade)      |
| parent    | C    | Yes      | omment? @relation("CommentReplies", fields: [parentId], references: [id]) |
| replies   | C    | Yes      | omment[] @relation("CommentReplies")                                      |

**Indexes:**

- `@@index([postId])`
- `@@index([authorId])`
- `@@index([parentId])`

**Relations:**

- author → U
- post → P
- parent → C
- replies → C

### Review

| Field     | Type | Required | Attributes                                                             |
| --------- | ---- | -------- | ---------------------------------------------------------------------- |
| id        | S    | Yes      | tring @id @default(cuid())                                             |
| rating    | I    | Yes      | nt                                                                     |
| content   | S    | Yes      | tring? @db.Text                                                        |
| authorId  | S    | Yes      | tring                                                                  |
| artistId  | S    | Yes      | tring?                                                                 |
| shopId    | S    | Yes      | tring?                                                                 |
| createdAt | D    | Yes      | ateTime @default(now())                                                |
| updatedAt | D    | Yes      | ateTime @updatedAt                                                     |
| author    | U    | Yes      | ser @relation(fields: [authorId], references: [id], onDelete: Cascade) |
| artist    | A    | Yes      | rtist? @relation(fields: [artistId], references: [id])                 |
| shop      | S    | Yes      | hop? @relation(fields: [shopId], references: [id])                     |

**Indexes:**

- `@@index([artistId])`
- `@@index([shopId])`
- `@@index([authorId])`

**Relations:**

- author → U
- artist → A
- shop → S

### Booking

| Field           | Type | Required | Attributes                                                           |
| --------------- | ---- | -------- | -------------------------------------------------------------------- |
| id              | S    | Yes      | tring @id @default(cuid())                                           |
| userId          | S    | Yes      | tring                                                                |
| artistId        | S    | Yes      | tring                                                                |
| shopId          | S    | Yes      | tring?                                                               |
| date            | D    | Yes      | ateTime                                                              |
| duration        | I    | Yes      | nt?                                                                  |
| description     | S    | Yes      | tring? @db.Text                                                      |
| tattooIdea      | S    | Yes      | tring? @db.Text                                                      |
| placement       | S    | Yes      | tring?                                                               |
| size            | S    | Yes      | tring?                                                               |
| referenceImages | S    | Yes      | tring[]                                                              |
| reference       | S    | Yes      | tring?                                                               |
| status          | B    | Yes      | ookingStatus @default(PENDING)                                       |
| price           | D    | Yes      | ecimal? @db.Decimal(10, 2)                                           |
| currency        | S    | Yes      | tring @default("USD")                                                |
| artistNotes     | S    | Yes      | tring? @db.Text                                                      |
| createdAt       | D    | Yes      | ateTime @default(now())                                              |
| updatedAt       | D    | Yes      | ateTime @updatedAt                                                   |
| user            | U    | Yes      | ser @relation(fields: [userId], references: [id], onDelete: Cascade) |
| artist          | A    | Yes      | rtist @relation(fields: [artistId], references: [id])                |
| shop            | S    | Yes      | hop? @relation(fields: [shopId], references: [id])                   |
| notifications   | N    | Yes      | otification[]                                                        |
| conversation    | C    | Yes      | onversation?                                                         |

**Indexes:**

- `@@index([userId])`
- `@@index([artistId])`
- `@@index([shopId])`
- `@@index([date])`
- `@@index([status])`

**Relations:**

- user → U
- artist → A
- shop → S

### ArtistAvailability

| Field     | Type | Required | Attributes                                                               |
| --------- | ---- | -------- | ------------------------------------------------------------------------ |
| id        | S    | Yes      | tring @id @default(cuid())                                               |
| artistId  | S    | Yes      | tring                                                                    |
| dayOfWeek | I    | Yes      | nt                                                                       |
| startTime | S    | Yes      | tring                                                                    |
| endTime   | S    | Yes      | tring                                                                    |
| createdAt | D    | Yes      | ateTime @default(now())                                                  |
| updatedAt | D    | Yes      | ateTime @updatedAt                                                       |
| artist    | A    | Yes      | rtist @relation(fields: [artistId], references: [id], onDelete: Cascade) |

**Indexes:**

- `@@unique([artistId, dayOfWeek])`
- `@@index([artistId])`

**Relations:**

- artist → A

### Notification

| Field     | Type | Required | Attributes                                                           |
| --------- | ---- | -------- | -------------------------------------------------------------------- |
| id        | S    | Yes      | tring @id @default(cuid())                                           |
| userId    | S    | Yes      | tring                                                                |
| type      | N    | Yes      | otificationType                                                      |
| title     | S    | Yes      | tring                                                                |
| message   | S    | Yes      | tring @db.Text                                                       |
| read      | B    | Yes      | oolean @default(false)                                               |
| bookingId | S    | Yes      | tring?                                                               |
| link      | S    | Yes      | tring?                                                               |
| createdAt | D    | Yes      | ateTime @default(now())                                              |
| user      | U    | Yes      | ser @relation(fields: [userId], references: [id], onDelete: Cascade) |
| booking   | B    | Yes      | ooking? @relation(fields: [bookingId], references: [id])             |

**Indexes:**

- `@@index([userId, read])`
- `@@index([userId, createdAt])`
- `@@index([bookingId])`

**Relations:**

- user → U
- booking → B

### Follower

| Field       | Type | Required | Attributes                                                                             |
| ----------- | ---- | -------- | -------------------------------------------------------------------------------------- |
| id          | S    | Yes      | tring @id @default(cuid())                                                             |
| followerId  | S    | Yes      | tring                                                                                  |
| followingId | S    | Yes      | tring                                                                                  |
| createdAt   | D    | Yes      | ateTime @default(now())                                                                |
| follower    | U    | Yes      | ser @relation("Followers", fields: [followerId], references: [id], onDelete: Cascade)  |
| following   | U    | Yes      | ser @relation("Following", fields: [followingId], references: [id], onDelete: Cascade) |

**Indexes:**

- `@@unique([followerId, followingId])`
- `@@index([followerId])`
- `@@index([followingId])`

**Relations:**

- follower → U
- following → U

### AIGeneration

| Field     | Type | Required | Attributes                                                           |
| --------- | ---- | -------- | -------------------------------------------------------------------- |
| id        | S    | Yes      | tring @id @default(cuid())                                           |
| userId    | S    | Yes      | tring                                                                |
| prompt    | S    | Yes      | tring @db.Text                                                       |
| imageUrl  | S    | Yes      | tring?                                                               |
| style     | S    | Yes      | tring?                                                               |
| placement | S    | Yes      | tring?                                                               |
| colorType | S    | Yes      | tring?                                                               |
| status    | A    | Yes      | IGenerationStatus @default(PENDING)                                  |
| createdAt | D    | Yes      | ateTime @default(now())                                              |
| user      | U    | Yes      | ser @relation(fields: [userId], references: [id], onDelete: Cascade) |

**Indexes:**

- `@@index([userId])`
- `@@index([createdAt])`

**Relations:**

- user → U

### TattooPreview

| Field           | Type | Required | Attributes                                                           |
| --------------- | ---- | -------- | -------------------------------------------------------------------- |
| id              | S    | Yes      | tring @id @default(cuid())                                           |
| userId          | S    | Yes      | tring                                                                |
| bodyImageUrl    | S    | Yes      | tring                                                                |
| tattooImageUrl  | S    | Yes      | tring                                                                |
| previewImageUrl | S    | Yes      | tring?                                                               |
| placement       | S    | Yes      | tring?                                                               |
| positionX       | F    | Yes      | loat @default(50)                                                    |
| positionY       | F    | Yes      | loat @default(50)                                                    |
| scale           | F    | Yes      | loat @default(1)                                                     |
| rotation        | F    | Yes      | loat @default(0)                                                     |
| opacity         | F    | Yes      | loat @default(0.85)                                                  |
| createdAt       | D    | Yes      | ateTime @default(now())                                              |
| user            | U    | Yes      | ser @relation(fields: [userId], references: [id], onDelete: Cascade) |

**Indexes:**

- `@@index([userId])`
- `@@index([createdAt])`

**Relations:**

- user → U

### Like

| Field     | Type | Required | Attributes                                                                |
| --------- | ---- | -------- | ------------------------------------------------------------------------- |
| id        | S    | Yes      | tring @id @default(cuid())                                                |
| userId    | S    | Yes      | tring                                                                     |
| postId    | S    | Yes      | tring?                                                                    |
| tattooId  | S    | Yes      | tring?                                                                    |
| createdAt | D    | Yes      | ateTime @default(now())                                                   |
| user      | U    | Yes      | ser @relation(fields: [userId], references: [id], onDelete: Cascade)      |
| post      | P    | Yes      | ost? @relation(fields: [postId], references: [id], onDelete: Cascade)     |
| tattoo    | T    | Yes      | attoo? @relation(fields: [tattooId], references: [id], onDelete: Cascade) |

**Indexes:**

- `@@unique([userId, postId])`
- `@@unique([userId, tattooId])`
- `@@index([userId])`
- `@@index([postId])`
- `@@index([tattooId])`

**Relations:**

- user → U
- post → P
- tattoo → T

### Conversation

| Field        | Type | Required | Attributes                                               |
| ------------ | ---- | -------- | -------------------------------------------------------- |
| id           | S    | Yes      | tring @id @default(cuid())                               |
| bookingId    | S    | Yes      | tring? @unique                                           |
| lastMessage  | S    | Yes      | tring? @db.Text                                          |
| lastActivity | D    | Yes      | ateTime @default(now())                                  |
| createdAt    | D    | Yes      | ateTime @default(now())                                  |
| booking      | B    | Yes      | ooking? @relation(fields: [bookingId], references: [id]) |
| participants | C    | Yes      | onversationParticipant[]                                 |
| messages     | M    | Yes      | essage[]                                                 |

**Indexes:**

- `@@index([lastActivity])`

**Relations:**

- booking → B

### ConversationParticipant

| Field          | Type | Required | Attributes                                                                           |
| -------------- | ---- | -------- | ------------------------------------------------------------------------------------ |
| id             | S    | Yes      | tring @id @default(cuid())                                                           |
| conversationId | S    | Yes      | tring                                                                                |
| userId         | S    | Yes      | tring                                                                                |
| lastReadAt     | D    | Yes      | ateTime @default(now())                                                              |
| createdAt      | D    | Yes      | ateTime @default(now())                                                              |
| conversation   | C    | Yes      | onversation @relation(fields: [conversationId], references: [id], onDelete: Cascade) |
| user           | U    | Yes      | ser @relation(fields: [userId], references: [id], onDelete: Cascade)                 |

**Indexes:**

- `@@unique([conversationId, userId])`
- `@@index([userId])`
- `@@index([conversationId])`

**Relations:**

- conversation → C
- user → U

### Message

| Field          | Type | Required | Attributes                                                                           |
| -------------- | ---- | -------- | ------------------------------------------------------------------------------------ |
| id             | S    | Yes      | tring @id @default(cuid())                                                           |
| conversationId | S    | Yes      | tring                                                                                |
| senderId       | S    | Yes      | tring                                                                                |
| content        | S    | Yes      | tring @db.Text                                                                       |
| read           | B    | Yes      | oolean @default(false)                                                               |
| createdAt      | D    | Yes      | ateTime @default(now())                                                              |
| conversation   | C    | Yes      | onversation @relation(fields: [conversationId], references: [id], onDelete: Cascade) |
| sender         | U    | Yes      | ser @relation(fields: [senderId], references: [id], onDelete: Cascade)               |

**Indexes:**

- `@@index([conversationId, createdAt])`
- `@@index([senderId])`

**Relations:**

- conversation → C
- sender → U

---

## Enum Values

### UserRole

- USER
- ARTIST
- SHOP_OWNER
- ADMIN

### ShopArtistRole

- OWNER
- LEAD_ARTIST
- ARTIST
- GUEST
- APPRENTICE

### TattooStyle

- TRADITIONAL
- NEO_TRADITIONAL
- JAPANESE
- BLACKWORK
- FINE_LINE
- MINIMALIST
- REALISM
- TRIBAL
- BIOMECHANICAL
- ABSTRACT
- WATERCOLOR
- GEOMETRIC
- DOTWORK
- CHICANO
- OTHER

### ColorType

- COLOR
- BLACK_AND_GREY
- MIXED

### BookingStatus

- PENDING
- CONFIRMED
- CANCELLED
- COMPLETED
- NO_SHOW

### NotificationType

- BOOKING_REQUEST
- BOOKING_CONFIRMED
- BOOKING_CANCELLED
- BOOKING_COMPLETED
- NEW_REVIEW
- NEW_FOLLOWER
- POST_LIKE
- POST_COMMENT
- NEW_MESSAGE
- SYSTEM

### AIGenerationStatus

- PENDING
- COMPLETED
- FAILED
