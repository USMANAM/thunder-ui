/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react"
import { Button } from "@/components/ui/button"
import { IconFilter, IconTrash, IconX } from "@tabler/icons-react"
import type { TField } from "@/core/lib/jsonSchemaToFields"
import {
  Controller,
  FormProvider,
  useForm,
  type SubmitHandler,
} from "react-hook-form"
import {
  Combobox,
  ComboboxTrigger,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxInput,
} from "@/components/ui/combobox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { renderField } from "../form/RenderInput"
import { getOperator } from "./operators"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Badge } from "@/components/ui/badge"

type TFilterValue = Record<
  string,
  { value: any; meta: { operator: string; multi: boolean } }
>

export type TFilter = {
  filters?: TFilterValue
  fields: TField[]
  onChange: (value?: TFilterValue) => void
}

export function Filters({ filters, fields, onChange }: TFilter) {
  const methods = useForm({ defaultValues: filters })
  const [open, setOpen] = React.useState(false)
  const [selectedFields, setSelectedFields] = React.useState<string[]>(
    Object.keys(filters ?? {})
  )

  React.useEffect(() => {
    const filterFields = fields.filter((v) =>
      selectedFields.includes(v.name ?? "")
    )
    for (const field of filterFields) {
      const initialValue = Object.entries(getOperator(field) ?? {}).at(0)?.[1]
      methods.setValue(`${field.name}.meta.operator`, initialValue!)
      methods.setValue(`${field.name}.meta.multi`, field.multi!)
    }
  }, [selectedFields, fields, methods])

  function resetFilter() {
    setSelectedFields([])
    methods.reset()
    onChange(undefined)
  }

  const onSubmit: SubmitHandler<unknown> = async (body) => onChange(body as any)

  return fields.length ? (
    <FormProvider {...methods}>
      <Combobox
        multiple
        autoHighlight
        value={selectedFields}
        items={fields
          .map((v) => ({ ...v, required: false }))
          .filter((v) => !["url"].includes(v.type))}
        onValueChange={(value) =>
          setSelectedFields((prev) => [...value, ...prev])
        }
        onOpenChangeComplete={() => setOpen(true)}
      >
        <ComboboxTrigger
          render={(props) => (
            <div className="flex items-center gap-3">
              <div className="relative">
                <Button variant="outline" {...props}>
                  <IconFilter />
                  <span className="hidden md:block">Filters</span>
                </Button>

                {selectedFields.length > 0 && (
                  <Badge className="absolute -top-1 -right-3">
                    {selectedFields.length}
                  </Badge>
                )}
              </div>

              {selectedFields.length > 0 && (
                <Button
                  size="icon-sm"
                  variant="destructive"
                  onClick={resetFilter}
                >
                  <IconTrash />
                </Button>
              )}
            </div>
          )}
        />

        <ComboboxContent className="w-full">
          <ComboboxInput showTrigger={false} placeholder="Search" />
          <ComboboxEmpty>No items found.</ComboboxEmpty>
          <ComboboxList>
            {(field, index) => (
              <ComboboxItem key={`${field.name}_${index}`} value={field.name}>
                {field?.label ?? field.name}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>

      <Sheet
        open={open}
        modal={false}
        disablePointerDismissal
        onOpenChange={setOpen}
      >
        <SheetContent
          side="bottom"
          className="mx-auto max-w-md rounded-t-2xl border"
        >
          <SheetHeader>
            <SheetTitle>Filters</SheetTitle>
            <SheetDescription>Change or update your filters</SheetDescription>
          </SheetHeader>
          <form onSubmit={methods.handleSubmit(onSubmit)}>
            <FieldGroup className="max-h-100 overflow-y-auto">
              {selectedFields.length ? (
                fields
                  .filter((v) => selectedFields.includes(v.name!))
                  .map((field) => {
                    const operators = Object.entries(getOperator(field) ?? {})

                    return (
                      <div
                        className="flex flex-wrap items-start gap-3 px-5 pb-2"
                        key={field.name}
                      >
                        <Field>
                          <FieldLabel htmlFor={field.name}>
                            {field.label ?? field.name}
                          </FieldLabel>
                          <div className="flex items-start gap-3">
                            <div className="flex w-full flex-col gap-3">
                              {renderField({
                                id: field.name!,
                                name: `${field.name!}.value`,
                                field,
                                control: methods.control,
                              })}
                            </div>
                            <Controller
                              control={methods.control}
                              name={`${field.name!}.meta.operator`}
                              render={({ field: _field }) => (
                                <Select
                                  value={_field.value ?? ""}
                                  onValueChange={_field.onChange}
                                  itemToStringLabel={(v) =>
                                    operators.find(
                                      ([, value]) => value === v
                                    )?.[0] ?? ""
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder={"Selector"} />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {operators.map(([label, value]) => (
                                      <SelectItem key={value} value={value}>
                                        {label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              )}
                            />

                            <Button
                              variant="destructive"
                              onClick={() => {
                                setSelectedFields((prev) =>
                                  prev.filter((name) => name !== field.name)
                                )
                                methods.unregister(field.name!)
                              }}
                            >
                              <IconX />
                            </Button>
                          </div>
                        </Field>
                      </div>
                    )
                  })
              ) : (
                <Empty>
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <IconFilter />
                    </EmptyMedia>
                    <EmptyTitle>No Filter Selected</EmptyTitle>
                    <EmptyDescription>
                      You didn't select any filter
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              )}
            </FieldGroup>
            <SheetFooter className="flex flex-row">
              <Button
                variant="secondary"
                className="grow"
                disabled={!selectedFields.length}
                onClick={resetFilter}
              >
                Reset
              </Button>
              <Button
                type="submit"
                className="grow"
                disabled={!selectedFields.length}
              >
                Apply
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </FormProvider>
  ) : null
}
