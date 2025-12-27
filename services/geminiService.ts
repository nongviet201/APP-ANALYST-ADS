
import { GoogleGenAI } from "@google/genai";

export const analyzeData = async (data: any, context: string) => {
  // Fix: Ensure standard initialization with process.env.API_KEY as a direct named parameter
  if (!process.env.API_KEY) {
      throw new Error("Hệ thống chưa tìm thấy Environment API Key. Vui lòng đảm bảo bạn đang chạy trong môi trường đã cấu hình API Key.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Bạn là trợ lý phân tích dữ liệu chuyên nghiệp cho chiến dịch quảng cáo cá nhân.
    
    DỮ LIỆU (${context}):
    ${JSON.stringify(data, null, 2)}
    
    YÊU CẦU:
    1. Tóm tắt nhanh các chỉ số quan trọng (Spend, Revenue, Profit, ROI, CP/DS...).
    2. Đánh giá hiệu quả: Tốt/Xấu/Bình thường.
    3. Cảnh báo đỏ: Các chỉ số đang gây lỗ hoặc bất thường.
    4. Đề xuất hành động ngay lập tức.
    
    Văn phong: Ngắn gọn, súc tích, chuyên nghiệp, dùng emoji để làm nổi bật ý chính.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    // Fix: Access response.text property directly as per latest SDK
    return response.text;
  } catch (error) {
    console.error("Gemini analysis error:", error);
    throw error;
  }
};
