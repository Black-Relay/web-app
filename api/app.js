require('dotenv').config()

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const yaml = require('yaml')
const swaggerUi = require('swagger-ui-express')
const fs = require('fs')
const { authCheck, adminCheck } = require('./utils/auth.js')
const { reSubscribeToTopics } = require('./utils/helpers.js')

const app = express();
const port = process.env.API_PORT || 3001;
const corsConfig = {
  origin: process.env.FRONTEND_URL ? process.env.FRONTEND_URL : 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
}

const authRoutes = require('./routes/auth.js')
const topicRoutes = require('./routes/topic.js')
const userRoutes = require('./routes/user.js')
const eventRoutes = require('./routes/event.js')

const swaggerYamlFile = fs.readFileSync('./swagger.yaml', 'utf8')
const swaggerDocument = yaml.parse(swaggerYamlFile)

const nonTopicCollections = [
  "users",
  "rbacgroups",
  "events",
  "topics"
]

app.use(cors(corsConfig));
app.use(express.json());
app.use(cookieParser(process.env.COOKIE_SECRET))

app.get('/', (req, res) => res.status(200).send('Black-Relay API server is running.'))

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))
app.use('/auth', authRoutes)
app.use('/topic', authCheck, topicRoutes)
app.use('/user', authCheck, adminCheck, userRoutes)
app.use('/event', authCheck, eventRoutes)

reSubscribeToTopics(nonTopicCollections)

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log(`API URL: http://localhost:${port}`);
});
