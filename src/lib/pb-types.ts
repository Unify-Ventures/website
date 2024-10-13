/**
* This file was @generated using pocketbase-typegen
*/

import type PocketBase from 'pocketbase'
import type { RecordService } from 'pocketbase'

export enum Collections {
	Funds = "funds",
	PortfolioCompanies = "portfolio_companies",
	Team = "team",
}

// Alias types for improved usability
export type IsoDateString = string
export type RecordIdString = string
export type HTMLString = string

// System fields
export type BaseSystemFields<T = never> = {
	id: RecordIdString
	created: IsoDateString
	updated: IsoDateString
	collectionId: string
	collectionName: Collections
	expand?: T
}

export type AuthSystemFields<T = never> = {
	email: string
	emailVisibility: boolean
	username: string
	verified: boolean
} & BaseSystemFields<T>

// Record types for each collection

export type FundsRecord = {
	accent: string
	homepage: string
	logo: string
	name: string
}

export enum PortfolioCompaniesStageOptions {
	"product_launch" = "product_launch",
	"market_validation" = "market_validation",
	"scaling" = "scaling",
	"liquidity_event" = "liquidity_event",
	"revenue_momentum" = "revenue_momentum",
}
export type PortfolioCompaniesRecord = {
	accent: string
	featured?: boolean
	funds: RecordIdString[]
	homepage: string
	invert_foreground?: boolean
	logo: string
	name: string
	stage?: PortfolioCompaniesStageOptions
}

export type TeamRecord = {
	blurb: string
	linkedin: string
	name: string
	picture: string
	title: string
}

// Response types include system fields and match responses from the PocketBase API
export type FundsResponse<Texpand = unknown> = Required<FundsRecord> & BaseSystemFields<Texpand>
export type PortfolioCompaniesResponse<Texpand = unknown> = Required<PortfolioCompaniesRecord> & BaseSystemFields<Texpand>
export type TeamResponse<Texpand = unknown> = Required<TeamRecord> & BaseSystemFields<Texpand>

// Types containing all Records and Responses, useful for creating typing helper functions

export type CollectionRecords = {
	funds: FundsRecord
	portfolio_companies: PortfolioCompaniesRecord
	team: TeamRecord
}

export type CollectionResponses = {
	funds: FundsResponse
	portfolio_companies: PortfolioCompaniesResponse
	team: TeamResponse
}

// Type for usage with type asserted PocketBase instance
// https://github.com/pocketbase/js-sdk#specify-typescript-definitions

export type TypedPocketBase = PocketBase & {
	collection(idOrName: 'funds'): RecordService<FundsResponse>
	collection(idOrName: 'portfolio_companies'): RecordService<PortfolioCompaniesResponse>
	collection(idOrName: 'team'): RecordService<TeamResponse>
}
