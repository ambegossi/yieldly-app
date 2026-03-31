import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/core/dropdown-menu";
import { Text } from "@/components/core/text";
import { useCallback, useMemo, useRef, useState } from "react";
import { ScrollView, TextInput, View } from "react-native";
import { FilterButton } from "./filter-button";

interface FilterDropdownProps {
  label: "Network" | "Protocol";
  options: string[];
  selectedValue: string | null;
  onSelect: (value: string | null) => void;
}

export function FilterDropdown({
  label,
  options,
  selectedValue,
  onSelect,
}: FilterDropdownProps) {
  const [search, setSearch] = useState("");
  const inputRef = useRef<TextInput>(null);

  const filteredOptions = useMemo(
    () =>
      search
        ? options.filter((o) => o.toLowerCase().includes(search.toLowerCase()))
        : options,
    [options, search],
  );

  const handleOpenChange = useCallback((open: boolean) => {
    if (!open) {
      setSearch("");
    } else {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, []);

  const handleSelect = useCallback(
    (option: string) => {
      onSelect(selectedValue === option ? null : option);
    },
    [onSelect, selectedValue],
  );

  return (
    <DropdownMenu onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <FilterButton label={label} activeCount={selectedValue !== null ? 1 : 0} />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        sideOffset={4}
        className="min-w-[200px]"
      >
        <View className="p-2">
          <TextInput
            ref={inputRef}
            className="rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground outline-none focus:border-brand"
            placeholder={`Search ${label.toLowerCase()}...`}
            value={search}
            onChangeText={setSearch}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <ScrollView className="max-h-72">
          {filteredOptions.map((option) => (
            <DropdownMenuCheckboxItem
              key={option}
              className="hover:bg-brand focus:bg-brand active:bg-transparent"
              checked={selectedValue === option}
              onCheckedChange={() => handleSelect(option)}
              closeOnPress
            >
              <Text className="group-hover:text-white group-focus:text-white">
                {option}
              </Text>
            </DropdownMenuCheckboxItem>
          ))}

          {filteredOptions.length === 0 && (
            <View className="px-2 py-4">
              <Text className="text-center text-sm text-muted-foreground">
                No results
              </Text>
            </View>
          )}
        </ScrollView>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
