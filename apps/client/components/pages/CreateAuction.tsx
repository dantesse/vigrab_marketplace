"use client";

import { createAuction } from "@/actions/CreateAuction";
import { getCategoryTree, type CategoryNode } from "@/actions/GetCategories";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Auctionschema, AuctionT, FieldSchema } from "@/types/auction";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { User } from "lucia";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import ImageUpload from "../ImageUpload";
import CategoryCascadePicker, {
  type CascadeSelection,
} from "../CategoryCascadePicker";
import { Button } from "../ui/button";
import DateTimePickerComponent from "../ui/DateTimePickerComponent";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";

const CreateAuction = ({ user }: { user: User }) => {
  const router = useRouter();
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [imgUrls, setImgUrls] = useState<string[]>([]);
  const [selection, setSelection] = useState<CascadeSelection>({
    categoryId: null,
    path: [],
    fieldSchema: null,
  });
  const [extraValues, setExtraValues] = useState<Record<string, string>>({});

  const { data: tree = [] } = useQuery<CategoryNode[]>({
    queryKey: ["categoryTree"],
    queryFn: () => getCategoryTree(),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<AuctionT>({
    resolver: zodResolver(Auctionschema),
  });

  const { mutate: server_createAuction, isPending } = useMutation({
    mutationFn: async (formData: AuctionT) => {
      return await createAuction(formData, imgUrls, user?.id as string);
    },
    onSuccess: () => {
      toast.success("Annonsen har skapats!");
      router.push("/my-auctions");
    },
    onError: () => {
      toast.error("Kunde inte skapa annonsen. Försök igen.");
    },
  });

  useEffect(() => {
    setValue("startDate", startDate);
  }, [startDate, setValue]);
  useEffect(() => {
    setValue("endDate", endDate);
  }, [endDate, setValue]);
  useEffect(() => {
    setValue("categoryId", selection.categoryId ?? "");
    // Drop stale extra values when category changes
    setExtraValues({});
  }, [selection.categoryId, setValue]);

  const fieldSchema: FieldSchema | null = selection.fieldSchema;

  const onSubmit = (data: AuctionT) => {
    // Guard: require leaf-ish selection (no further children possible OR a fieldSchema present)
    const deepest = selection.path[selection.path.length - 1];
    if (!deepest) {
      toast.error("Välj en kategori först.");
      return;
    }
    if (deepest.children.length > 0) {
      toast.error("Välj en mer specifik underkategori.");
      return;
    }
    if (imgUrls.length === 0) {
      toast.error("Ladda upp minst en bild.");
      return;
    }
    // Validate required dynamic fields
    if (fieldSchema) {
      for (const f of fieldSchema.fields) {
        if (f.required && !extraValues[f.name]) {
          toast.error(`${f.label} krävs.`);
          return;
        }
      }
    }
    server_createAuction({ ...data, extraFields: extraValues });
  };

  return (
    <div className="max-w-4xl px-4 py-5 mx-auto mt-10 sm:px-6 lg:px-8 dark:border border rounded-lg mb-10">
      <h1 className="mb-6 text-3xl font-bold flex items-center justify-center">
        Skapa ny annons
      </h1>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 w-full">
          <div className="grid gap-4">
            {/* Category — cascade picker first, so dynamic fields appear below */}
            <div>
              <Label className="text-base font-semibold">Kategori</Label>
              <p className="text-xs text-muted-foreground mb-2">
                Välj kategori steg för steg så visas rätt fält för din produkt.
              </p>
              <CategoryCascadePicker tree={tree} onChange={setSelection} />
              {errors.categoryId && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.categoryId.message}
                </p>
              )}
              {selection.path.length > 0 && (
                <p className="text-xs text-muted-foreground mt-2">
                  {selection.path.map((n) => n.name).join(" › ")}
                </p>
              )}
            </div>

            {/* Title */}
            <div>
              <Label>Titel</Label>
              <Input
                {...register("title")}
                placeholder="Ange annonstitel"
              />
              {errors.title && (
                <p className="text-red-500 text-sm">{errors.title.message}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <Label>Beskrivning</Label>
              <Textarea
                {...register("description")}
                placeholder="Beskriv varan"
              />
              {errors.description && (
                <p className="text-red-500 text-sm">
                  {errors.description.message}
                </p>
              )}
            </div>

            {/* Starting Price */}
            <div>
              <Label>Utropspris (SEK)</Label>
              <Input
                type="number"
                onChange={(e) =>
                  setValue("startingPrice", Number(e.target.value))
                }
                placeholder="0"
              />
              {errors.startingPrice && (
                <p className="text-red-500 text-sm">
                  {errors.startingPrice.message}
                </p>
              )}
            </div>

            {/* Dates */}
            <div>
              <Label>Startdatum</Label>
              <DateTimePickerComponent Datehandler={(d) => setStartDate(d)} />
              {errors.startDate && (
                <p className="text-red-500 text-sm">
                  {errors.startDate.message}
                </p>
              )}
            </div>
            <div>
              <Label>Slutdatum</Label>
              <DateTimePickerComponent Datehandler={(d) => setEndDate(d)} />
              {errors.endDate && (
                <p className="text-red-500 text-sm">
                  {errors.endDate.message}
                </p>
              )}
            </div>

            {/* Dynamic extra fields from fieldSchema */}
            {fieldSchema && fieldSchema.fields.length > 0 && (
              <div className="border border-border rounded-lg p-4 flex flex-col gap-3 bg-muted/30">
                <p className="text-sm font-semibold">Produktdetaljer</p>
                {fieldSchema.fields.map((field) => (
                  <div key={field.name}>
                    <Label>
                      {field.label}
                      {field.required && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </Label>
                    {field.type === "select" && field.options ? (
                      <Select
                        value={extraValues[field.name] ?? undefined}
                        onValueChange={(val) =>
                          setExtraValues((prev) => ({
                            ...prev,
                            [field.name]: val,
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue
                            placeholder={`Välj ${field.label.toLowerCase()}`}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {field.options.map((opt) => (
                            <SelectItem key={opt} value={opt}>
                              {opt}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        type={field.type === "number" ? "number" : "text"}
                        placeholder={field.label}
                        value={extraValues[field.name] ?? ""}
                        onChange={(e) =>
                          setExtraValues((prev) => ({
                            ...prev,
                            [field.name]: e.target.value,
                          }))
                        }
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Image */}
          <div className="grid gap-4 h-full">
            <div className="flex items-center justify-center h-full">
              <ImageUpload ImageURLs={(urls) => setImgUrls(urls)} />
            </div>
          </div>
        </div>

        <div className="flex justify-center w-full mt-3">
          <Button type="submit" className="w-1/3" disabled={isPending}>
            {isPending ? "Publicerar…" : "Publicera"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateAuction;
