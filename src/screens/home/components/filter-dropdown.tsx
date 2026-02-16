import { Text } from "@/components/core/text";
import { useCallback, useRef, useState } from "react";
import { Modal, Pressable, ScrollView, View } from "react-native";
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
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<View>(null);

  const handleSelect = useCallback(
    (value: string | null) => {
      onSelect(value);
      setIsOpen(false);
    },
    [onSelect],
  );

  return (
    <View ref={buttonRef}>
      <FilterButton
        label={label}
        activeFilter={selectedValue}
        onPress={() => setIsOpen(!isOpen)}
      />
      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <Pressable className="flex-1" onPress={() => setIsOpen(false)}>
          <View className="absolute left-4 right-4 top-24 max-h-80 rounded-lg border border-border bg-card shadow-lg">
            <ScrollView>
              <Pressable
                onPress={() => handleSelect(null)}
                className="flex-row items-center justify-between border-b border-border px-4 py-3 active:bg-accent"
                accessibilityRole="menuitem"
              >
                <Text className="text-base text-foreground">All</Text>
                {selectedValue === null && (
                  <Text className="text-primary">✓</Text>
                )}
              </Pressable>
              {options.map((option) => (
                <Pressable
                  key={option}
                  onPress={() => handleSelect(option)}
                  className="flex-row items-center justify-between px-4 py-3 active:bg-accent"
                  accessibilityRole="menuitem"
                >
                  <Text className="text-base text-foreground">{option}</Text>
                  {selectedValue === option && (
                    <Text className="text-primary">✓</Text>
                  )}
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}
