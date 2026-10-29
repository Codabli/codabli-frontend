export class EnumHelper {
    public static GetLastDeclaredValue<T extends object>(enumType: T): T[keyof T]
    {
        const memberNames: string[] =
            Object.keys(enumType)
                  .filter((key: string): boolean => isNaN(Number(key)));

        const lastName: string = memberNames[memberNames.length - 1];
        
        return enumType[lastName as keyof T];
    }
}