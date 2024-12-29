#include "UhfRfidDriver.h"


/// @brief 送信: 23. Set the transmitting power
/// @param power db(x100) ex. 2600 = 26db
/// @param immidiately 
/// @return 
bool UhfRfidDriver::commandTxPower(uint16_t power, bool immidiately)
{
    uint8_t command_param[2];
    uint8_t *seek = command_param;

    seek += _write_uint16_to_stream(seek, power);

    uint16_t command_param_length = seek - command_param;
    return _send(UhfRfidCommand::UhfRfidCommand_SetTheTransmittingPower, command_param, command_param_length, immidiately);
}


/// @brief 製造情報取得
/// @param what UhfRfidInformationType で指定
/// @param immidiately 
/// @return 
bool UhfRfidDriver::commandInformation(UhfRfidInformationType what, bool immidiately)
{
    uint8_t command_param[1];
    uint8_t *seek = command_param;

    seek += _write_uint8_to_stream(seek, what);

    uint16_t command_param_length = seek - command_param;
    return _send(UhfRfidCommand::UhfRfidCommand_Information, command_param, command_param_length, immidiately);
}


/// @brief 3. Single polling instruction
/// @param immidiately 
/// @return 
bool UhfRfidDriver::commandSinglePollingInstruction(bool immidiately)
{
    /*
        EPCClass1Gen2 プロトコルでインベントリのポーリング操作を完了します。 
        Select 操作は、このディレクティブに含まれていません。
        アンプは、各ポーリング命令が実行される前と後に自動的にオン/オフされます。 
        Inventory コマンドの 1 回のポーリングでは、Query operation パラメータは別のコマンドによって設定され、初期値はすでにファームウェアに含まれています。 
        次のコマンドは、1 ラウンドでインベントリをポーリングするコマンドです。

        1回のポーリング命令を受け取った後、チップがCRC検証のために正しいラベルを読み取ることができれば、チップMCUはRSSI、PC、EPC、およびCRCを含むデータを返します。 
        EPC がタグを読み取るときは 1 つのコマンド応答を返し、複数のタグを読み取るときは複数のコマンド応答を返します。 

        RSSI 値はチップ入力の信号サイズを反映しており、アンテナ・ゲインと指向性カプラの減衰は含まれていません。
        RSSIはチップの入力での信号強度であり、16進数の符号付き数値はdBmで測定されます。

        ラベルが返されない場合、または返されたデータ CRC 検証エラーが正しくない場合は、エラー コード 0x15 が返されます。
    */
    return _send(UhfRfidCommand::UhfRfidCommand_SinglePollingInstruction, nullptr, 0, immidiately);
}


/// @brief 4. Multiple polling instructions
/// @param count 
/// @param immidiately 
/// @return 
bool UhfRfidDriver::commandMultiPollingInstruction(uint16_t count, bool immidiately)
{
    uint8_t command_param[3];
    uint8_t *seek = command_param;

    seek += _write_uint8_to_stream(seek, 0x22); // reserved number.
    seek += _write_uint16_to_stream(seek, count);

    uint16_t command_param_length = seek - command_param;
    return _send(UhfRfidCommand::UhfRfidCommand_Information, command_param, command_param_length, immidiately);
}


/// @brief 7. Get the SELECT parameter
/// @param immidiately 
/// @return 
bool UhfRfidDriver::commandGetTheSelectParameter(bool immidiately)
{
    return _send(UhfRfidCommand::UhfRfidCommand_GetTheSelectParameter, nullptr, 0, immidiately);
}


/// @brief Select パラメータの設定
/// @param target 
/// Target は、Select がタグの SL フラグを変更するか、インベントリされたフラグを変更するかを示し、インベントリされた場合は、さらに 4 つのセッションのいずれかを指定します。
/// SLフラグを変更するSelectは、インベントリされたフラグを変更してはならない。また、その逆も同様である。
/// タグは、ターゲットが 101(2)、110(2)、または 111(2) の Select を無視するものとします。
/// @param action 
/// アクションは、表 6.30 の Tag 動作を引き出します。
/// この動作では、一致するタグと一致しないタグが SL をアサートまたはディアサートするか、インベントリされたフラグを A または B に設定します。
/// MemBank、Pointer、Length、および Mask フィールドの内容に準拠するタグが一致しています。
/// これらのフィールドの内容に準拠していないタグが一致していません。
/// タグが一致しているかどうかを判断するための基準は、MemBank、Pointer、Length、および Mask フィールドによって指定されます。
/// @param membank 
/// MemBankは、タグがマスクを適用する方法を指定します。
/// MemBank=00(2) の場合、タグは FileType が Mask に一致するファイルを少なくとも 1 つ検索します。
/// MemBank=01(2)、10(2)、11(2) の場合、タグは EPC メモリ バンク、TID メモリ バンク、または File_0 にそれぞれマスクを適用します。
/// Select は、1 つの FileType またはメモリ バンクを指定します。
/// 連続セレクトは、異なるファイルタイプやメモリバンクに適用される場合があります。
/// @param pointer 
/// Pointer は、マスク比較の開始ビット アドレスを指定します。
/// ポインタは、EBV フォーマット (付録 A を参照) とビット (ワードではない) アドレス指定を使用します。
/// MemBank=00(2) の場合、質問者は Pointer を 00h に設定します。
/// タグがMemBank=00(2)と0以外のポインタ値を持つSelectを受け取った場合、Selectを無視する必要があります。
/// @param length 
/// マスクの長さを指定します。
/// 0 から 255 ビットまでのマスクの長さが可能です。
/// Mem Bank=00(2) の場合、質問者は Length=00001000(2) を設定する。
/// タグがMemBank=00(2)とLength!=00001000(2)のSelectを受け取った場合、そのSelectは無視されます。
/// @param mask 
/// Mask は、
/// ・FileType (MemBank=00(2) の場合)
/// ・Tag が Pointer で始まり Length ビット後に終了するメモリ位置と比較するビット文字列 (MemBank<>002 の場合) 
/// のいずれかです。
/// 追跡不可能なタグは、
/// ・ユーザーメモリが追跡可能なMemBank=00(2)
/// ・Maskが完全に追跡可能なビット文字列で動作するMemBank<>00(2)を持つ選択
/// を処理する必要があります。
/// タグは、Maskが追跡不可能な隠しメモリを含むSelectコマンドと一致しないものとして扱う必要があります。
///
/// MemBank=00(2): 
/// タグに指定された FileType のファイルがある場合、タグは一致しています。
/// タグがファイルをサポートしていないか、指定した FileType のファイルがない場合、タグは一致しません。
///
/// MemBank<>00(2): 
/// Mask が Pointer と Length で指定された文字列と一致する場合、タグは一致しています。
/// ポインターと長さが存在しないメモリ位置を参照している場合、タグは一致していません。
/// Length が 0 の場合、Tag は一致しますが、Pointer が存在しないメモリ位置を参照しているか、
/// Truncate=1 で Pointer が StoredPC の length フィールドで指定された EPC の外部にある場合、Tag は一致しません。
/// @param truncate 
/// Truncate は、タグの後方散乱応答を Mask に続く EPC ビットに切り捨てるかどうかを示します。
/// インテロゲータがTruncateをアサートし、後続のQueryがSel=10またはSel=11を指定した場合、
/// 一致するTagは、そのACK応答をEPCのMaskの直後の部分に切り捨て、その後にPacketCRCを続けます。
/// 尋問者がTruncateを主張した場合、それを主張するものとします。
/// @param immidiately 
/// 即時実行フラグ
/// @return 
/// 送信に成功したか？ (あるいは、送信キューに乗せられたかどうか)
/// @details
///「選択」コマンドを使用すると、インテロゲーターはインベントリを作成する前に特定のタグ母集団を選択できます。
/// 選択はユーザー定義の基準に基づいており、和集合 (U)、交差 (∩)、および否定 (~) ベースのタグ分割が有効になります。
/// インテロゲータは、連続して Select コマンドを発行して、ユーザーと∩の操作を実行します。
/// Select では、タグの SL フラグをアサートまたはディアサートしたり、
/// タグのインベントリ済みフラグを 4 つのセッションのいずれかで A または B に設定したりできます。
///
/// Selectを受け取ると、強制終了されていないタグは準備完了状態に戻り、基準を評価し、評価によっては指定されたSLまたはインベントリされたフラグを変更する場合があります。
/// クエリ コマンドは、これらのフラグを使用して、後続のインベントリ ラウンドに参加するタグを選択します。
/// インテロゲータは、SLタグまたは~SLタグをインベントリしてアクセスすることも、SLフラグをまったく使用しないことを選択することもできます。
/// 選択は、強制終了以外の任意の状態のタグで開始でき、準備完了のタグで終了します。
///
/// [ターゲット] と [アクション] は、Select がタグの SL またはインベントリされたフラグを変更するかどうか、またどのように変更するかを示します。
/// また、インベントリされたフラグの場合は、どのセッションに対して変更するかを示します。
/// SL フラグを変更する Select は、インベントリード フラグを変更せず、その逆も同様です。
bool UhfRfidDriver::commandSetTheSelectParameterInstruction(
        UhfRfidSelectSelParamTarget target,
        UhfRfidSelectSelParamAction action,
        UhfRfidSelectSelParamMembank membank,
        uint32_t pointer,
        uint8_t length,
        uint8_t *mask,
        bool truncate,
        bool immidiately
    )
{
    uint8_t command_param[256];
    uint8_t *seek = command_param;

    UhfRfidSelectSelParamConvert SelParam;
    SelParam.format.MemBank = membank;
    SelParam.format.Action = action;
    SelParam.format.Target = target;
    seek += _write_uint8_to_stream(seek, SelParam.value);

    uint32_t applied_pointer = (membank == UhfRfidSelectSelParamMembank::UhfRfidSelectSelParamMembank_RFU) ? 0 : pointer;
    seek += _write_uint32_to_stream(seek, applied_pointer);

    uint8_t applied_length = (membank == UhfRfidSelectSelParamMembank::UhfRfidSelectSelParamMembank_RFU) ? 8 : length;
    seek += _write_uint8_to_stream(seek, applied_length);

    seek += _write_uint8_to_stream(seek, truncate ? 1 : 0);

    for(int index=0; index<length; ++index)
    {
        *seek = mask[index];
        seek++;
    }

    uint16_t command_param_length = seek - command_param;
    return _send(UhfRfidCommand::UhfRfidCommand_SetTheSelectParameterInstruction, command_param, command_param_length, immidiately);
}


/// @brief 8. Set the SELECT mode
/// @param mode 
/// @param immidiately 
/// @return 
bool UhfRfidDriver::commandSetTheSelectMode(UhfRfidSelectMode mode, bool immidiately)
{
    uint8_t command_param[1];
    command_param[0] = mode;
    return _send(UhfRfidCommand::UhfRfidCommand_SetTheSelectMode, command_param, sizeof(command_param), immidiately);
}


/// @brief 
/// @param access_password 
/// パスワード
/// @param membank 
/// 対象メモリバンク
/// @param sa
/// ラベル・データ域のアドレス・オフセットの読み取り 
/// @param dl 
/// 読み込み長。単位はワード、つまり2バイト/16ビットです。
/// @param immidiately 
/// @return 
bool UhfRfidDriver::commandReadLabelDataStorageArea(uint32_t access_password, UhfRfidSelectSelParamMembank membank, uint16_t sa, uint16_t dl, bool immidiately)
{
    uint8_t command_param[9];
    uint8_t *seek = command_param;

    seek += _write_uint32_to_stream(seek, access_password);
    seek += _write_uint8_to_stream(seek, membank);
    seek += _write_uint16_to_stream(seek, sa);
    seek += _write_uint16_to_stream(seek, dl);

    uint16_t param_length = seek - command_param;
    return _send(UhfRfidCommand::UhfRfidCommand_ReadLabelDataStorageArea, command_param, param_length, immidiately);
}


/// @brief 
/// @param access_password 
/// @param membank 
/// @param stream 
/// @param length 
/// @param sa 
/// @return 
bool UhfRfidDriver::commandWriteTheLabelDataStore(uint32_t access_password, UhfRfidSelectSelParamMembank membank, uint8_t *stream, int length, uint16_t sa, bool immidiately)
{
    uint8_t command_param[256];
    uint8_t *seek = command_param;

    seek += _write_uint32_to_stream(seek, access_password);
    seek += _write_uint8_to_stream(seek, membank);
    seek += _write_uint16_to_stream(seek, sa);
    seek += _write_uint16_to_stream(seek, length/2);

    for(int index=0; index<length; ++index)
    {
        seek[index] = stream[index];
    }
    seek += length;

    uint16_t param_length = seek - command_param;
    return _send(UhfRfidCommand::UhfRfidCommand_WriteTheLabelDataStore, command_param, param_length, immidiately);
}


/// @brief 14. Get parameters related to the Query command
/// @param immidiately 
/// @return 
bool UhfRfidDriver::commandGetParametersRelatedToTheQueryCommand(bool immidiately)
{
    return _send(UhfRfidCommand::UhfRfidCommand_GetParametersRelatedToTheQueryCommand, nullptr, 0, immidiately);
}


/// @brief 15. Set the Query parameter
/// @param dr 
/// @param m 
/// @param trext 
/// @param sel 
/// @param session 
/// @param target 
/// @param q 
/// @param immidiately 
/// @return 
bool UhfRfidDriver::commandSetTheQueryParameter(UhfRfidQueryParamDRType dr, UhfRfidQueryParamMType m, UhfRfidQueryParamTRextType trext,  UhfRfidQueryParamSelType sel, UhfRfidQueryParamSessionType session, UhfRfidQueryParamTargetType target, uint8_t q, bool immidiately)
{
    uint8_t command_param[2];
    uint8_t *seek = command_param;
    UhfRfidQueryParamConvert param;

    param.format.DR = dr;
    param.format.M = m;
    param.format.TRext = trext;
    param.format.Sel = sel;
    param.format.Session = session;
    param.format.Target = target;
    param.format.Q = q;

    seek += _write_uint16_to_stream(seek, param.value);

    uint16_t param_length = seek - command_param;
    return _send(UhfRfidCommand::UhfRfidCommand_SetTheQueryParameter, command_param, param_length, immidiately);
}



/// @brief 
/// @param password 
/// @param operations 
/// @param operation_count 
/// @param immidiately 
/// @return 
bool UhfRfidDriver::commandLockTheLOCKLabelDataStore(uint32_t password, UhfRfidLockOperation *operations, int operation_count, bool immidiately)
{
    uint8_t command_param[7];
    uint8_t *seek = command_param;

    seek += _write_uint32_to_stream(seek, password);

    // lock 情報の設定
    seek[0] = 0;
    seek[1] = 0;
    seek[2] = 0;
    for(int index=0; index<operation_count; ++index)
    {
        UhfRfidLockOperation *operation = operations + index;
        int operation_setting_index = operation->Memory + operation->Action;
        int operation_setting_array_index = operation_setting_index / 8;
        int operation_setting_array_shift = operation_setting_index & 7;
        int operatoin_mask_index = operation_setting_index + 10;
        int operation_mask_array_index = operatoin_mask_index / 8;
        int operation_mask_array_shift = operatoin_mask_index & 7;
        seek[operation_setting_array_index] |= (operation->Setting ? 1 : 0) << operation_setting_array_shift;
        seek[operation_mask_array_index] |= 1 << operation_setting_array_shift;
    }
    seek += 3;

    uint16_t param_length = seek - command_param;
    return _send(UhfRfidCommand::UhfRfidCommand_LockTheLOCKLabelDataStore, command_param, param_length, immidiately);
}
