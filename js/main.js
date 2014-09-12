$(document).ready(function() {
	setDate();
	setOptions();
	
	$(".add-item").trigger("click");
});

$(document).on("keyup", ".number-input", function() {
    var value = $(this).text();
    var parent = $(this).closest(".row").attr("id");
    updateItem(parent);
});

$(document).on("change", ".option", function() {
	var optionId = $(this).attr("id");
	var optionValue = $("#" + optionId + " option:selected").val();
	if (optionValue == "1") {
		$("#" + optionId + "-row").hide();
	}
	else if (optionValue == "2" || optionValue == "3") {
		$("#" + optionId + "-row").show();
	}
	
	setOptions();
    updateTotal();
});

$(document).on("click", ".invoice-line-item-remove", function() {
    var parent = $(this).closest(".row").attr("id");
    $("#" + parent).remove();
    updateTotal();
});

$(document).on("click", ".add-item", function() {
    var length = $(".items .row.item").length;
    var nextId = "item-" + (length + 1);
    $(".items").append('<div class="row item" id="' + nextId + '"></div>');
    var nextIdSelector = "#" + nextId;
    
    if (length > 0) {
    	$(nextIdSelector).append('<span class="glyphicon glyphicon-trash invoice-line-item-remove"></span>');
    }
    
    $(nextIdSelector).append('<div class="col-xs-6"><p contenteditable class="text-input">Açıklamayı buraya giriniz.</p></div>');
    $(nextIdSelector).append('<div class="col-xs-2"><p class="text-right"><span contenteditable class="number-input" data="quantity" onkeypress="return event.charCode >= 48 && event.charCode <= 57">1</span></p></div>');
    $(nextIdSelector).append('<div class="col-xs-2"><p class="text-right"><span contenteditable class="number-input" data="price" onkeypress="return event.charCode == 46 || (event.charCode >= 48 && event.charCode <= 57)">100.00</span></p></div>');
    $(nextIdSelector).append('<div class="col-xs-2"><p class="text-right"><span class="number-input" data="total">100.00</span></p></div>');
    updateItem(nextId);
});

var numbers = {
    1: "Bir", 2: "İki", 3: "Üç", 4: "Dört", 5: "Beş", 6: "Altı", 7: "Yedi", 8: "Sekiz", 9: "Dokuz",
    10: "On", 20: "Yirmi", 30: "Otuz", 40: "Kırk", 50: "Elli", 60: "Altmış", 70: "Yetmiş", 80: "Seksen", 90: "Doksan", 100: "Yüz", 1000: "Bin", 1000000: "Milyon", 1000000000: "Milyar", 1000000000000: "Trilyon"
};

function setDate() {
	var today = new Date();
	var twoDigitMonth = today.getMonth() < 9 ? "0" + (today.getMonth() + 1) : (today.getMonth() + 1);
	$("span[data='date']").text(today.getDate() + "." + twoDigitMonth + "." + today.getFullYear());
}

function setOptions() {
	$("#discount-option-hidden").text($("#discount-option option:selected").val());
	$("#vat-option-hidden").text($("#vat-option option:selected").val());
}

function updateItem(itemId) {
    var quantity = $("#" + itemId + " span[data='quantity']").text();
    var price = $("#" + itemId + " span[data='price']").text();
    var total = (parseInt(quantity) * parseFloat(price)).toFixed(2);
    $("#" + itemId + " span[data='total']").text(total);
    updateTotal();
}

function updateSubtotal() {
    var subtotal = 0;
    $("span[data='total']").each(function() {
        subtotal += parseFloat($(this).text());
    });
    subtotal = subtotal.toFixed(2);
    $("span[data='subtotal']").text(subtotal);
    return parseFloat(subtotal);
}

function applyDiscount(subtotal) {
	var discount = parseInt($("span[data='discount']").text());
	var option = $("#discount-option-hidden").text();
	
	if (option == "2") {
		return subtotal - (subtotal * discount) / 100;
	}
	else if (option == "3") {
		return subtotal - discount;
	}
	
	return subtotal;
}

function applyVat(total) {
	var vat = parseInt($("span[data='vat']").text());
	var option = $("#vat-option-hidden").text();
	
	if (option == "2") {
		return total + (total * vat) / 100;
	}
	else if (option == "3") {
		return total + vat;
	}
	
	return total;
}

function updateTotal() {
    var subtotal = updateSubtotal();
    var discountedTotal = applyDiscount(subtotal);
    var total = applyVat(discountedTotal);
    total = total.toFixed(2);
    
    $("span[data='grandtotal']").text(total);
    $("p[data='grandtotal-text']").text(totalToText(total));
}

function totalToText(total) {
    var significant = total | 0;
    var text = numberToText(significant) + " Türk Lirası";
    
    var precision = (total * 100) % 100;
    if (precision > 0) {
        text += " " + numberToText(precision) + " Kuruş";   
    }
    return text;
}

function numberToText(number) {
    var text = "";
    var divisors = [1000000000000, 1000000000, 1000000, 1000, 1];
    var quotient = 0;
    for (var i = 0; i < divisors.length; i++) {
        quotient = (number / divisors[i]) | 0;
        if (quotient > 0) {
            var newQuotient = quotient % divisors[i-1];
            text += " " + hundredsToText(newQuotient, divisors[i]);
            if (divisors[i] > 1) {
                text += " " + numbers[divisors[i]];
            }
        }
        number = number % divisors[i];
    }
    return text;  
}

function hundredsToText(number, order) {
    var text = "";
    var quotient = (number / 100) | 0;
    if (number >= 100 && quotient > 0) {
        if (quotient > 1) {
            text += " " + numbers[quotient];
        }
        text += " " + numbers[100];
    }
    
    quotient = ((number % 100) / 10) | 0;
    if (number >= 10 && quotient > 0) {
        text += " " + numbers[quotient * 10];
    }
    
    quotient = (number % 10);
    if (!((quotient == 0) || (number == 1 && order == 1000))) {
        text += " " + numbers[quotient];
    }
    
    return text;
}

function printPage() {
	var originalContent = $("html").clone().html();
	var divContents = $("#bill").clone().html();
	var headContents = $("head").html();
	//document.body.innerHTML = divContents;
	document.write('');
	document.close();
	
	document.write("<html>");
	document.write(headContents);
	document.write("<body>");
	document.write(divContents);
	document.write("</body></html>");
	window.print();
	
	document.body.innerHTML = originalContent;
	
	setDate();
	setOptions();
	updateTotal();
	
	/*var divContents = $("#bill").html();
	var pWindow = window.open('', '', 'height=400,width=800');
	pWindow.document.write("<html>");
	pWindow.document.write($("head").html());
	pWindow.document.write("<body>");
	pWindow.document.write(divContents);
	pWindow.document.write("</body></html>");
	pWindow.document.close();
	pWindow.print();
	pWindow.close();*/
}