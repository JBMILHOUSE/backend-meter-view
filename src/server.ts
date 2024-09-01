import fastify from 'fastify'
import { env } from './env'
import { serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod'
import { errorHandler } from './error-handler'
import { createUpload } from './routes/create-upload'
import { changeConfirm } from './routes/change-confirm'
import { getCustomer } from './routes/get-customer'

const app = fastify()

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

app.setErrorHandler(errorHandler)

app.register(createUpload)
app.register(changeConfirm)
app.register(getCustomer)

app.listen({ port: env.PORT }).then(() => {
   console.log('Server running!')
})