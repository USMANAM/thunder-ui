import type { TField } from "@/core/lib/jsonSchemaToFields"

export const RangeOperator = {
  EQUAL: "$eq",
  NOT_EQUAL: "$ne",
  BETWEEN: "$bt",
  NOT_BETWEEN: "$nbt",
} as const

export const StringOperator = {
  MATCH: "$regex",
  NOT_MATCH: "$nregex",
  EQUAL: "$eq",
  NOT_EQUAL: "$ne",
} as const

export const NumberOperator = {
  EQUAL: "$eq",
  NOT_EQUAL: "$ne",
  GREATER_THAN: "$gte",
  LESS_THAN: "$lte",
} as const

export const BooleanOperator = {
  EQUAL: "$eq",
  NOT_EQUAL: "$ne",
} as const

export const OptionOperator = {
  EQUAL: "$eq",
  NOT_EQUAL: "$ne",
} as const

export const MultiOptionOperator = {
  ALL: "$all",
  INCLUDES: "$in",
  EXCLUDES: "$nin",
} as const

export const DateOperator = {
  EQUAL: "$eq",
  NOT_EQUAL: "$ne",
  GREATER_THAN: "$gte",
  LESS_THAN: "$lte",
} as const

const stringTypes = ["text", "email", "url"] as const

export function getOperator(field: TField) {
  const isStringType = stringTypes.includes(
    field.type as (typeof stringTypes)[number]
  )

  if (field.enum) {
    return MultiOptionOperator
  }

  if (isStringType) {
    return StringOperator
  }

  if (field.type === "boolean") {
    return BooleanOperator
  }

  if (field.type === "number") {
    if (field.multi) return NumberOperator
    return RangeOperator
  }

  if (field.type === "date") {
    if (field.multi) return DateOperator
    return RangeOperator
  }

  return undefined
}
