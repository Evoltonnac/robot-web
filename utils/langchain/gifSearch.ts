import { AIPluginTool } from 'langchain/tools'
import { Plugins } from '@/types/server/langchain'

const gifSearchJson = {
    name_for_human: 'Gif Search',
    name_for_model: Plugins.GifSearch,
    description_for_human: 'Search through a wide range of gifs.',
    description_for_model:
        'Assistant uses the Gif Search plugin to get relevant gifs or trending gifs. Assistant will reply with user language. Assistant will alawys reply a list of gifs with their title and image',
}

const gifSearchApiYaml = `components:
schemas:
  GiphyRequest:
    properties:
      query:
        title: Query
        type: string
    required:
    - query
    title: GiphyRequest
    type: object
  HTTPValidationError:
    properties:
      detail:
        items:
          $ref: '#/components/schemas/ValidationError'
        title: Detail
        type: array
    title: HTTPValidationError
    type: object
  ValidationError:
    properties:
      loc:
        items:
          anyOf:
          - type: string
          - type: integer
        title: Location
        type: array
      msg:
        title: Message
        type: string
      type:
        title: Error Type
        type: string
    required:
    - loc
    - msg
    - type
    title: ValidationError
    type: object
info:
description: Search through a wide range of gifs - Powered by Giphy.
title: GIF Search
version: 0.1.0
openapi: 3.0.2
paths:
/healthcheck:
  get:
    operationId: root_healthcheck_get
    responses:
      '200':
        content:
          application/json:
            schema: {}
        description: Successful Response
    summary: Root
/search:
  post:
    operationId: getSearchResults
    requestBody:
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/GiphyRequest'
      required: true
    responses:
      '200':
        content:
          application/json:
            schema: {}
        description: Successful Response
      '422':
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/HTTPValidationError'
        description: Validation Error
    summary: Get a list of gifs based on the search query
/trending:
  get:
    operationId: getTrendingResults
    responses:
      '200':
        content:
          application/json:
            schema: {}
        description: Successful Response
    summary: Get a list of gifs based on the current trends
servers:
- url: https://chat-plugin-giphy.efficiency.tools`

export const GifSearch = new AIPluginTool({
    name: gifSearchJson.name_for_model,
    description: `Call this tool to get the OpenAPI spec (and usage guide) for interacting with the ${gifSearchJson.name_for_human} API. You should only call this ONCE! What is the ${gifSearchJson.name_for_human} API useful for? ${gifSearchJson.description_for_human}`,
    apiSpec: `Usage Guide: ${gifSearchJson.description_for_model}

You should use request tools to interact with OpenAPI. OpenAPI Spec in YAML format:\n${gifSearchApiYaml}`,
})
