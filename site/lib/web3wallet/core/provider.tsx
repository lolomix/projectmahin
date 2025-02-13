import React, {createContext, useContext, useEffect, useMemo} from 'react'
import invariant from 'tiny-invariant'

import { Web3ReactContextInterface } from './types'
import { useWeb3ReactManager } from './manager'
import {ConnectorSet} from "../Connector";

export const PRIMARY_KEY = 'primary'
const CONTEXTS: { [key: string]: React.Context<Web3ReactContextInterface> } = {}

interface Web3ReactProviderArguments {
  getLibrary: (provider?: any, connector?: Required<Web3ReactContextInterface>['connector']) => any
  children: any,
  connectors?: ConnectorSet
}

export function createWeb3ReactRoot(key: string): (args: Web3ReactProviderArguments) => JSX.Element {
  invariant(!CONTEXTS[key], `A root already exists for provided key ${key}`)

  CONTEXTS[key] = createContext<Web3ReactContextInterface>({
    activate: async () => {
      invariant(false, 'No <Web3ReactProvider ... /> found.')
    },
    setError: () => {
      invariant(false, 'No <Web3ReactProvider ... /> found.')
    },
    deactivate: () => {
      invariant(false, 'No <Web3ReactProvider ... /> found.')
    },
    active: false
  })
  CONTEXTS[key].displayName = `Web3ReactContext - ${key}`

  const Provider = CONTEXTS[key].Provider

  return function Web3ReactProvider({ getLibrary, children, connectors }: Web3ReactProviderArguments): JSX.Element {
    // The hook contains the real logic.
    const {
      connector,
      provider,
      chainId,
      account,
      activate,
      setError,
      deactivate,
      activatingConnector,
      error
    } = useWeb3ReactManager({connectors})

    // Combine multiple properties into a new "active" field.
    const active = connector !== undefined && chainId !== undefined && account !== undefined && !!!error

    // Once we are active and have a chain id, ask the caller to give us a Provider instance with their  preferred lib.
    const library = useMemo(
        () =>
            active && chainId !== undefined && Number.isInteger(chainId) && !!connector
                ? getLibrary(provider, connector)
                : undefined,
        [active, getLibrary, provider, connector, chainId]
    );

    const web3ReactContext: Web3ReactContextInterface = {
      connector,
      library,
      chainId,
      account,
      activatingConnector,
      connectors,

      activate,
      setError,
      deactivate,

      active,
      error
    }

    return <Provider value={web3ReactContext}>{children}</Provider>
  }
}

export const Web3ReactProvider = createWeb3ReactRoot(PRIMARY_KEY)

export function getWeb3ReactContext<T = any>(key: string = PRIMARY_KEY): React.Context<Web3ReactContextInterface<T>> {
  invariant(Object.keys(CONTEXTS).includes(key), `Invalid key ${key}`)
  return CONTEXTS[key]
}

export function useWeb3React<T = any>(key?: string): Web3ReactContextInterface<T> {
  return useContext(getWeb3ReactContext(key))
}