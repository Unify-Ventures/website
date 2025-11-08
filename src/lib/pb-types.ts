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
export type IsoAutoDateString = string & { readonly autodate: unique symbol }
export type RecordIdString = string
export type FileNameString = string & { readonly filename: unique symbol }
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
	created: IsoAutoDateString
	fingerprint: string
	id: string
	recordRef: string
	updated: IsoAutoDateString
}

export type ExternalauthsRecord = {
	collectionRef: string
	created: IsoAutoDateString
	id: string
	provider: string
	providerId: string
	recordRef: string
	updated: IsoAutoDateString
}

export type MfasRecord = {
	collectionRef: string
	created: IsoAutoDateString
	id: string
	method: string
	recordRef: string
	updated: IsoAutoDateString
}

export type OtpsRecord = {
	collectionRef: string
	created: IsoAutoDateString
	id: string
	password: string
	recordRef: string
	sentTo?: string
	updated: IsoAutoDateString
}

export type SuperusersRecord = {
	created: IsoAutoDateString
	email: string
	emailVisibility?: boolean
	id: string
	password: string
	tokenKey: string
	updated: IsoAutoDateString
	verified?: boolean
}

export type FundsRecord = {
	closed?: boolean
	created: IsoAutoDateString
	id: string
	manager: RecordIdString
	name: string
	short_name?: string
	updated: IsoAutoDateString
}

export type ManagersRecord = {
	accent: string
	created: IsoAutoDateString
	featured?: boolean
	homepage: string
	id: string
	logo: FileNameString
	name: string
	updated: IsoAutoDateString
}

export enum PortfolioCompaniesStageOptions {
	"product_launch" = "product_launch",
	"market_validation" = "market_validation",
	"scaling" = "scaling",
	"revenue_momentum" = "revenue_momentum",
	"liquidity_event" = "liquidity_event",
	"unassigned" = "unassigned",
}
export type PortfolioCompaniesRecord<Tformer_names = unknown, Tmetadata = unknown> = {
	accent: string
	blurb?: HTMLString
	created: IsoAutoDateString
	former_names?: null | Tformer_names
	funds?: RecordIdString[]
	homepage: string
	id: string
	inactive?: boolean
	invert_foreground?: boolean
	logo: FileNameString
	metadata?: null | Tmetadata
	name: string
	release?: boolean
	stage?: PortfolioCompaniesStageOptions
	unoptimised_logo?: FileNameString
	updated: IsoAutoDateString
	use_unoptimised_logo?: boolean
}

export type TeamRecord = {
	blurb: string
	created: IsoAutoDateString
	id: string
	linkedin: string
	name: string
	picture: FileNameString
	title: string
	updated: IsoAutoDateString
}

// Response types include system fields and match responses from the PocketBase API
export type AuthoriginsResponse<Texpand = unknown> = Required<AuthoriginsRecord> & BaseSystemFields<Texpand>
export type ExternalauthsResponse<Texpand = unknown> = Required<ExternalauthsRecord> & BaseSystemFields<Texpand>
export type MfasResponse<Texpand = unknown> = Required<MfasRecord> & BaseSystemFields<Texpand>
export type OtpsResponse<Texpand = unknown> = Required<OtpsRecord> & BaseSystemFields<Texpand>
export type SuperusersResponse<Texpand = unknown> = Required<SuperusersRecord> & AuthSystemFields<Texpand>
export type FundsResponse<Texpand = unknown> = Required<FundsRecord> & BaseSystemFields<Texpand>
export type ManagersResponse<Texpand = unknown> = Required<ManagersRecord> & BaseSystemFields<Texpand>
export type PortfolioCompaniesResponse<Tformer_names = unknown, Tmetadata = unknown, Texpand = unknown> = Required<PortfolioCompaniesRecord<Tformer_names, Tmetadata>> & BaseSystemFields<Texpand>
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

// Utility types for create/update operations

type ProcessCreateAndUpdateFields<T> = Omit<{
	// Omit AutoDate fields
	[K in keyof T as Extract<T[K], IsoAutoDateString> extends never ? K : never]: 
		// Convert FileNameString to File
		T[K] extends infer U ? 
			U extends (FileNameString | FileNameString[]) ? 
				U extends any[] ? File[] : File 
			: U
		: never
}, 'id'>

// Create type for Auth collections
export type CreateAuth<T> = {
	id?: RecordIdString
	email: string
	emailVisibility?: boolean
	password: string
	passwordConfirm: string
	verified?: boolean
} & ProcessCreateAndUpdateFields<T>

// Create type for Base collections
export type CreateBase<T> = {
	id?: RecordIdString
} & ProcessCreateAndUpdateFields<T>

// Update type for Auth collections
export type UpdateAuth<T> = Partial<
	Omit<ProcessCreateAndUpdateFields<T>, keyof AuthSystemFields>
> & {
	email?: string
	emailVisibility?: boolean
	oldPassword?: string
	password?: string
	passwordConfirm?: string
	verified?: boolean
}

// Update type for Base collections
export type UpdateBase<T> = Partial<
	Omit<ProcessCreateAndUpdateFields<T>, keyof BaseSystemFields>
>

// Get the correct create type for any collection
export type Create<T extends keyof CollectionResponses> =
	CollectionResponses[T] extends AuthSystemFields
		? CreateAuth<CollectionRecords[T]>
		: CreateBase<CollectionRecords[T]>

// Get the correct update type for any collection
export type Update<T extends keyof CollectionResponses> =
	CollectionResponses[T] extends AuthSystemFields
		? UpdateAuth<CollectionRecords[T]>
		: UpdateBase<CollectionRecords[T]>

// Type for usage with type asserted PocketBase instance
// https://github.com/pocketbase/js-sdk#specify-typescript-definitions

export type TypedPocketBase = {
	collection<T extends keyof CollectionResponses>(
		idOrName: T
	): RecordService<CollectionResponses[T]>
} & PocketBase
