#ifndef __UHF_RFID_FORMAT_H_
#define __UHF_RFID_FORMAT_H_
#include <Arduino.h>

#define HEADER_MAGIC_NUMBER (0xBB)
#define FOOTER_MAGIC_NUMBER (0x7E)


/// @brief フレームタイプ
enum UhfRfidFrameType
{
    /// @brief send to M100 chip.
    TypeCommand = 0,
    /// @brief response from M100 chip.
    TypeResponse = 1,
    /// @brief notify from M100 chip.
    /// 1 つのポーリング命令と複数のポーリング命令にも、対応する通知フレームがあります。 
    /// マイコンから送信された通知フレームの数は、読み取り状況に応じて自律的にホストコンピュータに送信されます。 
    /// リーダーがタグを読み取ると通知フレームが送信され、リーダーが複数のタグを読み取ると、複数の通知フレームが送信されます
    TypeNotify = 2,
};


/// @brief フレーム構造
enum UhfRfidChunk
{
    ChunkInvalid,
    ChunkHeader,
    ChunkType,
    ChunkCommand,
    ChunkLength,
    ChunkParameter,
    ChunkChecksum,
    ChunkFooter,
};


/// @brief コマンドフレーム定義
enum UhfRfidCommand
{
    UhfRfidCommand_Information = 0x03,
    UhfRfidCommand_SetTheTransmittingPower = 0xB6,

    UhfRfidCommand_GetTheSelectParameter = 0x0B,
    UhfRfidCommand_SetTheSelectParameterInstruction = 0x0C,
    UhfRfidCommand_SetTheSelectMode = 0x12,

    UhfRfidCommand_GetParametersRelatedToTheQueryCommand = 0x0D,
    UhfRfidCommand_SetTheQueryParameter = 0x0E,

    /// @brief EPCClass1Gen2 プロトコルでインベントリのポーリング操作を完了します。 
    /// @details
    /// Select 操作は、このディレクティブに含まれていません。
    /// アンプは、各ポーリング命令が実行される前と後に自動的にオン/オフされます。
    /// Inventory コマンドの 1 回のポーリングでは、Query operation パラメータは別のコマンドによって設定され、初期値はすでにファームウェアに含まれています。 
    UhfRfidCommand_SinglePollingInstruction = 0x22,
    UhfRfidCommand_MultiPollingInstruction = 0x27,


    UhfRfidCommand_ReadLabelDataStorageArea = 0x39,
    UhfRfidCommand_WriteTheLabelDataStore = 0x49,
};


/// @brief レスポンスフレーム定義
enum UhfRfidResponse
{
    UhfRfidResponse_GetTheSelectParameter = 0x0B,
    UhfRfidResponse_Error = 0xff,
    UhfRfidResponse_ReadLabelDataStorageArea = 0x39,
    UhfRfidResponse_GetParametersRelatedToTheQueryCommand = 0x0D,
};


/// @brief 通知フレーム定義
enum UhfRfidNotify
{
    UhfRfidNotify_Polling = 0x22,
};


enum UhfRfidErrorType
{
    /// @brief タグ データ ストレージ領域の読み取りに失敗しました。 タグが返されないか、返されたデータの CRC 検証エラー
    UhfRfidErrorType_ReadFail = 0x09,
    /// @brief アクセスタグが失敗した場合は、パスワードが間違っている可能性があります。
    UhfRfidErrorType_AccessFail = 0x16,
    /// @briefタグデータストアの読み取りエラー。詳細として、下位ビットに UhfRfidErrorTypeErrorCode が入る。
    UhfRfidErrorType_AccessFailReadError = 0xA0,
    /// @brief ポーリング操作が失敗しました。 ラベルが返されないか、返されたデータ CRC 検証エラー。
    UhfRfidErrorType_InventoryFail = 0x15,
};

enum UhfRfidErrorCodeSupport
{
    /// @brief 指定されたラベル データ ストアが存在しません。 または、タグが XPC など、指定された長さの EPC をサポートしていない。
    UhfRfidErrorCodeSupport_MemoryOverrun = 0x03,
    /// @brief 指定されたラベル データ ストアがロックされているか、永続的にロックされており、ロック状態が書き込み不能または読み取り不能です
    UhfRfidErrorCodeSupport_MemoryLocked = 0x04,
    /// @brief タグは、タグに書き込むのに十分なエネルギーを受け取っていません
    UhfRfidErrorCodeSupport_InsufficientPower = 0xB,
    /// @brief タグはエラーコードの戻り値をサポートしていません
    UhfRfidErrorCodeSupport_NonSpecificError = 0xF,
};


/// -------------------------------------------------------------------------------------------------------------------------
/// PC(Protocol Control) に含まれる内容の解釈に関すること
/// -------------------------------------------------------------------------------------------------------------------------
/// @brief RFID の Protocol Control (PC) の内容
/// 参考文献:
/// https://www.mars-tohken.co.jp/techblog/flags-176-ictag/
/// https://www.mars-tohken.co.jp/techblog/flags210-ictag/
/// https://enjoy-rfid.blogspot.com/2016/08/epc.html
struct UhfRfidPCFormat
{
    /// @brief Toggleが0の場合にはすべて0です。1の場合はISO/IEC15962に規定されているAFI値
    uint16_t RFUorAFI:8;
    /// @brief global準拠か、非EPCglobal準拠か
    uint16_t Toggle:1;
    /// @brief 拡張PCの有無
    uint16_t XPC:1;
    /// @brief ank11[USER]メモリの有り/無し
    uint16_t UMI:1;
    /// @brief EPCの長さ。ワード単位(2bytes)で指定
    uint16_t Length:5;
};

union UhfRfidPCConvert
{
    uint16_t value;
    UhfRfidPCFormat format;
};


/// -------------------------------------------------------------------------------------------------------------------------
/// Session に関すること
/// -------------------------------------------------------------------------------------------------------------------------
/// @brief 
/// @details
/// 各セッションは Inventoried フラグを持つ。フラグは A と B という値を取りうる。
enum UhfRfidSessionType
{
    /// @brief 
    /// power on: 
    /// フラグ A に設定される。 
    UhfRfidSessionType_S0,

    /// @brief 
    /// power on:
    /// その保存された値に応じてAまたはBのいずれかにセットされるものとする。
    /// ただし、フラグが過去に永続化時間よりも長く設定されていた場合、タグはS1インベントリードフラグをAに設定して電源が入るものとする。
    /// S1インベントリフラグは自動的に更新されないため、タグの電源が供給されている場合でもBからAに戻ることがあります。
    ///
    /// タグは、永続性タイムアウトの結果として、タグがインベントリラウンドに参加している間、インベントリ中、またはアクセス中である間、S1インベントリフラグの値をBからAに変更してはならない。
    /// インベントリラウンド中にタグのS1フラグ永続化時間が満了した場合、タグは、
    /// (i)インテロゲーターの指示(例:インベントリまたはアクセス操作の終了時に一致するセッションを持つQueryAdjustまたはQueryRepによる)
    /// (ii)ラウンドの終了時(例:SelectまたはQueryの受信時)
    /// にのみフラグをAに変更するものとします。
    /// (i)の場合、タグがインベントリ作成またはアクセスされている最中にタグのS1フラグ永続化時間が経過すると、
    /// タグはインベントリまたはアクセス操作の終了時にフラグをAに変更する必要があります。
    /// (ii)の場合、タグは、セレクトまたはクエリを評価する前に、そのS1フラグを反転させるものとする。
    UhfRfidSessionType_S1,

    /// @brief 
    /// power on:
    /// S2インベントリフラグは、保存された値に応じてAまたはBのいずれかにセットされるものとする。
    /// ただし、タグが永続化時間を超えて電源を失った場合、タグはS2インベントリフラグをAに設定して電源をオンにするものとする。
    UhfRfidSessionType_S2,

    /// @brief
    /// power on:
    /// S3インベントリフラグは、保存された値に応じてAまたはBのいずれかにセットされるものとする。
    /// ただし、タグが永続化時間を超えて電力を失った場合、タグはS3インベントリフラグをAに設定して電源がオンになるものとする。
    UhfRfidSessionType_S3,
};


/*
タグは、電源が供給されている間は S2 フラグと S3 フラグを更新する必要があります。
つまり、タグの電源が切れるたびに、その S2 および S3 インベントリ フラグは、表 6.20 に示す設定時間と永続性時間を持つ必要があります。
*/
/*
    タグは、選択されたフラグSLを実装するものとし、インテロゲーターは、Selectコマンドを使用してこれをアサートまたはディアサートすることができる。

    Query コマンドの Sel パラメータを使用すると、
    インテロゲータは SL がアサートまたはディアサートされたタグ (SL または ~SL) をインベントリしたり、
    SL 値に関係なくフラグを無視してタグをインベントリしたりできます。
    
    SLは特定のセッションとそれほど関連付けられていません。SL はどのセッションでも使用でき、すべてのセッションに共通です。
*/
/*
    タグのCフラグ(6.3.2.1.2.5を参照)は、表6.20に示す設定時間と永続性を持つ必要があります。
    タグは、Cフラグと同じ永続性でResponseBuffer (6.3.1.6.4を参照)にデータを保持します。
    タグは、電源が供給されると C フラグを更新する必要があります。
    つまり、タグの電源が切れるたびに、その C フラグは表 6.20 に示す永続性を持つことになります
     (もちろん、タグの永続化時間が 0 秒の場合、タグが一時的に電源を切っても、その C フラグはデアサートされます)。
*/
/*
    タグは、選択されたフラグSLを実装するものとし、インテロゲーターは、Selectコマンドを使用してこれをアサートまたはディアサートすることができる。
    Query コマンドの Sel パラメータを使用すると、インテロゲータは SL がアサートまたはディアサートされたタグ (SL または ~SL) をインベントリしたり、
    SL 値に関係なくフラグを無視してタグをインベントリしたりできます。SLは特定のセッションとそれほど関連付けられていません。
    SL はどのセッションでも使用でき、すべてのセッションに共通です。

    タグのSLフラグは、表6.20に示す設定時間と永続性を持つものとする。
    タグは、SL永続化時間よりも長い時間、タグが電源を失った場合を除いて、保存された値に応じて、SLフラグがアサートまたはディアサートされた状態でパワーアップするものとする。
    ただし、その場合は、SLフラグがディアサートされた(~SLに設定)状態でパワーアップするものとする。
    タグは、電源が供給されるとSLフラグを更新する必要があります。
    つまり、タグの電源が切れるたびに、そのSLフラグは表6.20に示す永続性時間を持つことになります。

    タグのCフラグ(6.3.2.1.2.5を参照)は、表6.20に示す設定時間と永続性を持つ必要があります。
    タグは、Cフラグと同じ永続性でResponseBuffer (6.3.1.6.4を参照)にデータを保持します。
    タグは、電源が供給されると C フラグを更新する必要があります。
    つまり、タグの電源が切れるたびに、その C フラグは表 6.20 に示す永続性を持つことになります
     (もちろん、タグの永続化時間が 0 秒の場合、タグが一時的に電源を切っても、その C フラグはデアサートされます)。
*/

/// -------------------------------------------------------------------------------------------------------------------------
/// Select 命令に関すること
/// -------------------------------------------------------------------------------------------------------------------------
enum UhfRfidSelectSelParamTarget
{
    UhfRfidSelectSelParamTarget_Inventoried_1 = 0,
    UhfRfidSelectSelParamTarget_Inventoried_2 = 1,
    UhfRfidSelectSelParamTarget_Inventoried_3 = 2,
    UhfRfidSelectSelParamTarget_Inventoried_4 = 3,
    UhfRfidSelectSelParamTarget_SL = 4,
};

enum UhfRfidSelectSelParamAction
{
    /// @details
    /// Match: assert SL or inventoried → A 
    /// Not-Match: deassert SL or inventoried → B
    UhfRfidSelectSelParamAction_0,

    /// @details
    /// Match: assert SL or inventoried → A 
    /// Not-Match: do nothing 
    UhfRfidSelectSelParamAction_1,

    /// @details
    /// Match: do nothing 
    /// Not-Match: deassert SL or inventoried → B
    UhfRfidSelectSelParamAction_2,

    /// @details
    /// Match: negate SL or (A → B, B → A)
    /// Not-Match: do nothing 
    UhfRfidSelectSelParamAction_3,

    /// @details
    /// Match: deassert SL or inventoried → B 
    /// Not-Match: assert SL or inventoried → A 
    UhfRfidSelectSelParamAction_4,

    /// @details
    /// Match: deassert SL or inventoried → B 
    /// Not-Match: do nothing 
    UhfRfidSelectSelParamAction_5,

    /// @details
    /// Match: do nothing
    /// Not-Match: assert SL or inventoried → A 
    UhfRfidSelectSelParamAction_6,

    /// @details
    /// Match: do nothing
    /// Not-Match: negate SL or (A → B, B → A) 
    UhfRfidSelectSelParamAction_7,
};

enum UhfRfidSelectSelParamMembank
{
    UhfRfidSelectSelParamMembank_RFU = 0,
    UhfRfidSelectSelParamMembank_EPC = 1,
    UhfRfidSelectSelParamMembank_TID = 2,
    UhfRfidSelectSelParamMembank_User = 3,
};


struct UhfRfidSelectSelParamFormat
{
    /// @brief 対象となる記憶領域。UhfRfidSelectSelParamMembank のいずれかの値が入る
    uint8_t MemBank:2;
    /// @brief 
    uint8_t Action:3;
    /// @brief 
    uint8_t Target:3;
};

union UhfRfidSelectSelParamConvert
{
    uint8_t value;
    UhfRfidSelectSelParamFormat format;
};

enum UhfRfidSelectMode
{
  
};



/// -------------------------------------------------------------------------------------------------------------------------
/// Query 命令に関すること
/// -------------------------------------------------------------------------------------------------------------------------
struct UhfRfidQueryParamFormat
{
    /// @brief ラウンドのスロット数
    uint16_t Q:4;
    /// @brief インベントリされたフラグがAまたはBのタグがインベントリラウンドに参加するかどうか。
    /// タグは、個別化の結果として、インベントリされたフラグをAからBに(またはその逆に)変更できる。
    /// @details UhfRfidQueryParamTargetType で値定義
    uint16_t Target:1;
    /// @brief インベントリラウンドのセッション
    /// @details UhfRfidQueryParamSessionType で値定義
    uint16_t Session:2;
    /// @brief どのタグがクエリに応答するか 
    /// @details UhfRfidQueryParamSelType で値定義
    uint16_t Sel:2;
    /// @brief タグが T=>R プリアンブルの先頭にパイロットトーンを付けるかどうかを選択します。
    /// 遅延応答またはインプロセス応答(6.3.1.6を参照)を使用するコマンドに対するタグの応答は、TRext値に関係なく拡張プリアンブルを使用します。
    /// @details UhfRfidQueryParamTRextType で値定義
    uint16_t TRext:1;
    /// @brief T=>Rデータレート
    /// @details UhfRfidQueryParamMType で値定義。
    uint16_t M:2;
    /// @brief T=>R リンク周波数
    /// @details UhfRfidQueryParamDRType で値定義。
    uint16_t DR:1;
};

union UhfRfidQueryParamConvert
{
    uint16_t value;
    UhfRfidQueryParamFormat format;
};

enum UhfRfidQueryParamDRType
{
    UhfRfidQueryParamDRType_8 = 0,
    UhfRfidQueryParamDRType_64_per_3 = 1,
};

enum UhfRfidQueryParamMType
{
    UhfRfidQueryParamMType_1 = 0,
    UhfRfidQueryParamMType_2 = 1,
    UhfRfidQueryParamMType_4 = 2,
    UhfRfidQueryParamMType_8 = 3,
};

enum UhfRfidQueryParamTRextType
{
    UhfRfidQueryParamTRextType_NoPilotTone = 0,
    UhfRfidQueryParamTRextType_UsePilotTone = 1,
};

enum UhfRfidQueryParamSelType
{
    UhfRfidQueryParamSelType_ALL = 0,
    UhfRfidQueryParamSelType_ALL_alt = 1,
    UhfRfidQueryParamSelType_Negative_SL = 2,
    UhfRfidQueryParamSelType_SL = 3,
};

enum UhfRfidQueryParamSessionType
{
    UhfRfidQueryParamSessionType_S0 = 0,
    UhfRfidQueryParamSessionType_S1 = 1,
    UhfRfidQueryParamSessionType_S2 = 2,
    UhfRfidQueryParamSessionType_S3 = 3,
};

enum UhfRfidQueryParamTargetType
{
    UhfRfidQueryParamTargetType_A = 0,
    UhfRfidQueryParamTargetType_B = 1,
};



#endif
