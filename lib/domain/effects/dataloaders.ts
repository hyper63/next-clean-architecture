import Dataloader from 'dataloader'
import { always, filter, find, propEq } from 'ramda'

import { createClients } from './clients'

export type DataloaderConfig = {}

export type DataloadersContext = {
  clients: ReturnType<typeof createClients>
  /**
   * Dataloaders may reference each other
   * ie. priming
   */
  dataloaders: ReturnType<typeof createDataloaders>
}

/**
 * We use a dataloader to load documents from our hyper data service.
 *
 * With this, consumers can request a single document,
 * and then our dataloader will dedupe requests, load them in batch,
 * then finally cache each document
 *
 * Read more: https://github.com/graphql/dataloader
 */
const findByIdDataloader = (context: DataloadersContext) =>
  new Dataloader<string, { _id: string } | undefined>(async (ids) => {
    const {
      clients: { data }
    } = context

    return (
      data
        .query<{ _id: string }>({ _id: { $in: ids } }, { limit: Number.MAX_SAFE_INTEGER })
        /**
         * Order of the result array must match the input array
         *
         * Read More: https://github.com/graphql/dataloader#batch-function
         */
        .then((res) => {
          if (!res.ok) return ids.map(always(new Error(res.msg)))
          return ids.map((id) => find(propEq('_id', id), res.docs))
        })
    )
  })

const findByFavoriteColorDataloader = (context: DataloadersContext) =>
  new Dataloader<string, { _id: string; favoriteColor: string }[]>(async (colors) => {
    const {
      clients: { data }
    } = context

    return (
      data
        .query<{ _id: string; favoriteColor: string }>(
          { favoriteColor: { $in: colors } },
          { limit: Number.MAX_SAFE_INTEGER }
        )
        /**
         * Order of the result array must match the input array
         *
         * Read More: https://github.com/graphql/dataloader#batch-function
         */
        .then((res) => {
          if (!res.ok) return colors.map(always(new Error(res.msg)))
          return colors.map((color) => filter(propEq('favoriteColor', color), res.docs))
        })
    )
  })

export const createDataloaders = (context: any) => ({
  findByIdDataloader: findByIdDataloader(context),
  findByFavoriteColorDataloader: findByFavoriteColorDataloader(context)
})
