// components/ui/MultipleSelectCheckmarks.jsx
import React, { useState } from "react";
import { ChevronDown, Check, Search, X } from "lucide-react";
import { cn } from "../../../utils/cn";
import Button from "../buttons/button.component";
import Input from "./Input";

const MultipleSelectCheckmarks = React.forwardRef(({
    className,
    options = [],
    value = [],
    defaultValue = [],
    placeholder = "Selecione opções",
    disabled = false,
    required = false,
    label,
    description,
    error,
    searchable = false,
    clearable = false,
    loading = false,
    id,
    name,
    onChange,
    onOpenChange,
    showSelectAll = true,
    maxDisplayItems = 2,
    ...props
}, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    // Generate unique ID if not provided
    const selectId = id || `select-${Math.random()?.toString(36)?.substr(2, 9)}`;

    // Filter options based on search
    const filteredOptions = searchable && searchTerm
        ? options?.filter(option =>
            option?.label?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
            (option?.value && option?.value?.toString()?.toLowerCase()?.includes(searchTerm?.toLowerCase()))
        )
        : options;

    // Get selected option(s) for display
    const getSelectedDisplay = () => {
        const selectedOptions = options?.filter(opt => value?.includes(opt?.value));
        
        if (selectedOptions?.length === 0) return placeholder;
        
        if (selectedOptions?.length <= maxDisplayItems) {
            return selectedOptions?.map(opt => opt?.label)?.join(", ");
        }
        
        return `${selectedOptions?.length} itens selecionados`;
    };

    const handleToggle = () => {
        if (!disabled) {
            const newIsOpen = !isOpen;
            setIsOpen(newIsOpen);
            onOpenChange?.(newIsOpen);
            if (!newIsOpen) {
                setSearchTerm("");
            }
        }
    };

    const handleOptionToggle = (option) => {
        const newValue = value || [];
        const updatedValue = newValue?.includes(option?.value)
            ? newValue?.filter(v => v !== option?.value)
            : [...newValue, option?.value];
        onChange?.(updatedValue);
    };

    const handleSelectAll = () => {
        const availableOptions = filteredOptions?.filter(opt => !opt?.disabled);
        const allValues = availableOptions?.map(opt => opt?.value);
        const currentFilteredSelected = value?.filter(v => 
            availableOptions?.some(opt => opt?.value === v)
        );
        
        // If all filtered options are selected, deselect them
        if (currentFilteredSelected?.length === availableOptions?.length) {
            const updatedValue = value?.filter(v => 
                !allValues?.includes(v)
            );
            onChange?.(updatedValue);
        } else {
            // Select all filtered options
            const updatedValue = [...new Set([...value, ...allValues])];
            onChange?.(updatedValue);
        }
    };

    const handleClear = (e) => {
        e?.stopPropagation();
        onChange?.([]);
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e?.target?.value);
    };

    const isSelected = (optionValue) => {
        return value?.includes(optionValue) || false;
    };

    const isAllSelected = () => {
        const availableOptions = filteredOptions?.filter(opt => !opt?.disabled);
        return availableOptions?.length > 0 && 
               availableOptions?.every(opt => value?.includes(opt?.value));
    };

    const hasValue = value?.length > 0;

    return (
        <div className={cn("relative", className)}>
            {label && (
                <label
                    htmlFor={selectId}
                    className={cn(
                        "block text-sm font-medium leading-none mb-2",
                        error ? "text-destructive" : "text-foreground",
                        disabled && "opacity-70 cursor-not-allowed"
                    )}
                >
                    {label}
                    {required && <span className="text-destructive ml-1">*</span>}
                </label>
            )}
            <div className="relative">
                <button
                    ref={ref}
                    id={selectId}
                    type="button"
                    className={cn(
                        "flex h-10 w-full items-center justify-between rounded-md border border-input bg-white text-black px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                        error && "border-destructive focus:ring-destructive",
                        !hasValue && "text-muted-foreground"
                    )}
                    onClick={handleToggle}
                    disabled={disabled}
                    aria-expanded={isOpen}
                    aria-haspopup="listbox"
                    {...props}
                >
                    <span className="truncate">{getSelectedDisplay()}</span>

                    <div className="flex items-center gap-1 ml-2">
                        {loading && (
                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                        )}

                        {clearable && hasValue && !loading && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-4 w-4 p-0 hover:bg-transparent"
                                onClick={handleClear}
                            >
                                <X className="h-3 w-3" />
                            </Button>
                        )}

                        <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
                    </div>
                </button>

                {/* Hidden native select for form submission */}
                <select
                    name={name}
                    value={value}
                    onChange={() => { }}
                    className="sr-only"
                    tabIndex={-1}
                    multiple
                    required={required}
                >
                    <option value="">Select...</option>
                    {options?.map(option => (
                        <option key={option?.value} value={option?.value}>
                            {option?.label}
                        </option>
                    ))}
                </select>

                {/* Dropdown */}
                {isOpen && (
                    <div className="absolute z-50 w-full mt-1 bg-white text-black border border-border rounded-md shadow-md">
                        {searchable && (
                            <div className="p-2 border-b">
                                <div className="relative">
                                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Buscar opções..."
                                        value={searchTerm}
                                        onChange={handleSearchChange}
                                        className="pl-8"
                                        autoFocus
                                    />
                                </div>
                            </div>
                        )}

                        <div className="py-1 max-h-60 overflow-auto">
                            {showSelectAll && filteredOptions?.length > 0 && (
                                <div
                                    className={cn(
                                        "flex cursor-pointer select-none items-center gap-2 px-3 py-2 text-sm font-medium border-b hover:bg-accent hover:text-accent-foreground"
                                    )}
                                    onClick={handleSelectAll}
                                >
                                    <div className={cn(
                                        "flex h-4 w-4 items-center justify-center rounded border border-primary",
                                        isAllSelected() && "bg-primary text-primary-foreground"
                                    )}>
                                        {isAllSelected() && <Check className="h-3 w-3" />}
                                    </div>
                                    <span>Selecionar todos</span>
                                </div>
                            )}

                            {filteredOptions?.length === 0 ? (
                                <div className="px-3 py-2 text-sm text-muted-foreground">
                                    {searchTerm ? 'Nenhuma opção encontrada' : 'Nenhuma opção disponível'}
                                </div>
                            ) : (
                                filteredOptions?.map((option) => (
                                    <div
                                        key={option?.value}
                                        className={cn(
                                            "flex cursor-pointer select-none items-center gap-2 px-3 py-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                                            option?.disabled && "pointer-events-none opacity-50"
                                        )}
                                        onClick={() => !option?.disabled && handleOptionToggle(option)}
                                    >
                                        <div className={cn(
                                            "flex h-4 w-4 items-center justify-center rounded border border-primary shrink-0",
                                            isSelected(option?.value) && "bg-primary text-primary-foreground"
                                        )}>
                                            {isSelected(option?.value) && <Check className="h-3 w-3" />}
                                        </div>
                                        <div className="flex-1 flex flex-col">
                                            <span>{option?.label}</span>
                                            {option?.description && (
                                                <span className="text-xs text-muted-foreground">
                                                    {option?.description}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>
            {description && !error && (
                <p className="text-sm text-muted-foreground mt-1">
                    {description}
                </p>
            )}
            {error && (
                <p className="text-sm text-destructive mt-1">
                    {error}
                </p>
            )}
        </div>
    );
});

MultipleSelectCheckmarks.displayName = "MultipleSelectCheckmarks";

export default MultipleSelectCheckmarks;