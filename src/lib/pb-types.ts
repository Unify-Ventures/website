/**
* This file was @generated using pocketbase-typegen
*/

import type PocketBase from 'pocketbase'
import type { RecordService } from 'pocketbase'

export enum Collections {
	Authorigins = "_authOrigins",
	Externalauths = "_externalAuths",
	Mfas = "_mfas",
	Otps = "_otps",
	Superusers = "_superusers",
	Funds = "funds",
	Managers = "managers",
	PortfolioCompanies = "portfolio_companies",
	Team = "team",
}

// Alias types for improved usability
export type IsoDateString = string
export type RecordIdString = string
export type HTMLString = string

type ExpandType<T> = unknown extends T
	? T extends unknown
		? { expand?: unknown }
		: { expand: T }
	: { expand: T }

// System fields
export type BaseSystemFields<T = unknown> = {
	id: RecordIdString
	collectionId: string
	collectionName: Collections
} & ExpandType<T>

export type AuthSystemFields<T = unknown> = {
	email: string
	emailVisibility: boolean
	username: string
	verified: boolean
} & BaseSystemFields<T>

// Record types for each collection

export type AuthoriginsRecord = {
	collectionRef: string
	created?: IsoDateString
	fingerprint: string
	id: string
	recordRef: string
	updated?: IsoDateString
}

export type ExternalauthsRecord = {
	collectionRef: string
	created?: IsoDateString
	id: string
	provider: string
	providerId: string
	recordRef: string
	updated?: IsoDateString
}

export type MfasRecord = {
	collectionRef: string
	created?: IsoDateString
	id: string
	method: string
	recordRef: string
	updated?: IsoDateString
}

export type OtpsRecord = {
	collectionRef: string
	created?: IsoDateString
	id: string
	password: string
	recordRef: string
	sentTo?: string
	updated?: IsoDateString
}

export type SuperusersRecord = {
	created?: IsoDateString
	email: string
	emailVisibility?: boolean
	id: string
	password: string
	tokenKey: string
	updated?: IsoDateString
	verified?: boolean
}

export type FundsRecord = {
	closed?: boolean
	created?: IsoDateString
	featured?: boolean
	homepage: string
	id: string
	manager: RecordIdString
	name: string
	updated?: IsoDateString
}

export type ManagersRecord = {
	accent: string
	created?: IsoDateString
	featured?: boolean
	homepage: string
	id: string
	logo: string
	name: string
	updated?: IsoDateString
}

export enum PortfolioCompaniesStageOptions {
	"product_launch" = "product_launch",
	"market_validation" = "market_validation",
	"scaling" = "scaling",
	"revenue_momentum" = "revenue_momentum",
	"liquidity_event" = "liquidity_event",
}
export type PortfolioCompaniesRecord = {
	accent: string
	blurb?: HTMLString
	created?: IsoDateString
	funds: RecordIdString[]
	homepage: string
	id: string
	invert_foreground?: boolean
	logo: string
	name: string
	release?: boolean
	stage?: PortfolioCompaniesStageOptions
	updated?: IsoDateString
}

export type TeamRecord = {
	blurb: string
	created?: IsoDateString
	id: string
	linkedin: string
	name: string
	picture: string
	title: string
	updated?: IsoDateString
}

// Response types include system fields and match responses from the PocketBase API
export type AuthoriginsResponse<Texpand = unknown> = Required<AuthoriginsRecord> & BaseSystemFields<Texpand>
export type ExternalauthsResponse<Texpand = unknown> = Required<ExternalauthsRecord> & BaseSystemFields<Texpand>
export type MfasResponse<Texpand = unknown> = Required<MfasRecord> & BaseSystemFields<Texpand>
export type OtpsResponse<Texpand = unknown> = Required<OtpsRecord> & BaseSystemFields<Texpand>
export type SuperusersResponse<Texpand = unknown> = Required<SuperusersRecord> & AuthSystemFields<Texpand>
export type FundsResponse<Texpand = unknown> = Required<FundsRecord> & BaseSystemFields<Texpand>
export type ManagersResponse<Texpand = unknown> = Required<ManagersRecord> & BaseSystemFields<Texpand>
export type PortfolioCompaniesResponse<Texpand = unknown> = Required<PortfolioCompaniesRecord> & BaseSystemFields<Texpand>
export type TeamResponse<Texpand = unknown> = Required<TeamRecord> & BaseSystemFields<Texpand>

// Types containing all Records and Responses, useful for creating typing helper functions

export type CollectionRecords = {
	_authOrigins: AuthoriginsRecord
	_externalAuths: ExternalauthsRecord
	_mfas: MfasRecord
	_otps: OtpsRecord
	_superusers: SuperusersRecord
	funds: FundsRecord
	managers: ManagersRecord
	portfolio_companies: PortfolioCompaniesRecord
	team: TeamRecord
}

export type CollectionResponses = {
	_authOrigins: AuthoriginsResponse
	_externalAuths: ExternalauthsResponse
	_mfas: MfasResponse
	_otps: OtpsResponse
	_superusers: SuperusersResponse
	funds: FundsResponse
	managers: ManagersResponse
	portfolio_companies: PortfolioCompaniesResponse
	team: TeamResponse
}

// Type for usage with type asserted PocketBase instance
// https://github.com/pocketbase/js-sdk#specify-typescript-definitions

export type TypedPocketBase = PocketBase & {
	collection(idOrName: '_authOrigins'): RecordService<AuthoriginsResponse>
	collection(idOrName: '_externalAuths'): RecordService<ExternalauthsResponse>
	collection(idOrName: '_mfas'): RecordService<MfasResponse>
	collection(idOrName: '_otps'): RecordService<OtpsResponse>
	collection(idOrName: '_superusers'): RecordService<SuperusersResponse>
	collection(idOrName: 'funds'): RecordService<FundsResponse>
	collection(idOrName: 'managers'): RecordService<ManagersResponse>
	collection(idOrName: 'portfolio_companies'): RecordService<PortfolioCompaniesResponse>
	collection(idOrName: 'team'): RecordService<TeamResponse>
}
