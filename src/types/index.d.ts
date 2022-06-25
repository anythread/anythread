export {} //indicate it is a module type declaration

declare global {
  interface Window {
    swarm: {
      web2Helper: any
      localStorage: any
      sessionId: string
      bzzLink: any
    }
  }
}

export type PrefixedAddress = string & { __tag__?: 'PrefixedAddress' }
