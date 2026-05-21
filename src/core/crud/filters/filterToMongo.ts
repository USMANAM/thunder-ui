/* eslint-disable @typescript-eslint/no-explicit-any */
export type TServerValueTypes =
  | "string"
  | "number"
  | "boolean"
  | "date"
  | "regex"
  | "objectId"

export const valueWithType = (
  type: TServerValueTypes,
  value: any,
  options?: {
    regexFlags?: string
  }
) => {
  return {
    type,
    value: `${value}`,
    options,
  }
}

export const filterToMongo = (
  filter: Record<
    string,
    { value: any; meta: { operator: string; multi: boolean } }
  >
) => {
  const mongoFilter: Record<string, any> = {}

  for (const key in filter) {
    const condition = filter[key]

    if (condition.value instanceof Array && condition.meta.multi) {
      mongoFilter[key] = {
        [condition.meta.operator]: condition.value.map((val) =>
          valueWithType("string", val)
        ),
      }
    } else if (Array.isArray(condition.value) && !condition.meta.multi) {
      const type = typeof condition.value as any
      const query = {
        $gte: valueWithType(type, (condition.value as any[])[0]),
        $lte: valueWithType(type, (condition.value as any[])[1]),
      }
      mongoFilter[key] =
        condition.meta.operator === "$bt" ? query : { $not: query }
    } else {
      const type = typeof condition.value as any
      const queryValue = valueWithType(
        type === "string" ? "regex" : type,
        condition.value,
        type === "string" ? { regexFlags: "i" } : undefined
      )

      mongoFilter[key] =
        condition.meta.operator === "$nregex"
          ? { $not: { $regex: queryValue } }
          : { [condition.meta.operator]: queryValue }
    }
  }

  return mongoFilter
}
